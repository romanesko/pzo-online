import {db} from "@/database/drizzle";
import {booking, log, schedule} from "@/database/schema";
import {and, eq, gte, isNotNull, like, lt, sql} from "drizzle-orm";
import {lpad} from "@/lib/lpad";
import {formatDate} from "@/lib/common";


function parseLogObject(input: string) {
  const regex = /{{{([^}]+)}}}/g;
  const result = {} as { [key: string]: { id: number, label: string } };

// Extract and process matches
  let match;
  while ((match = regex.exec(input)) !== null) {
    // Parse the JSON string within the brackets
    const obj = JSON.parse(`{${match[1]}}`);
    // Use the 'type' as key and create object with 'id' and 'label'
    result[obj.type] = {
      id: obj.id,
      label: obj.label
    };
  }
  return result;
}


export const reportsRepo = {

  getAvailableDates(officeId:number){
    return db.select({
          year: schedule.year,
          month: schedule.month,
          unvisited: sql`sum(case when booking."visitedAt" is null then 1 else 0 end)`.mapWith(Number),
          visited: sql`sum(case when booking."visitedAt" is not null then 1 else 0 end)`.mapWith(Number)
        }
    ).from(booking).innerJoin(schedule, eq(schedule.id,booking.scheduleId))
        .where(
            and(
                eq(schedule.officeId,officeId),
            )
        )
        .groupBy(schedule.year,schedule.month) as Promise<{year:number, month:number, unvisited:number,visited:number }[]>
  },

  getStatByOfficeAndMonth(officeId: number, year: number, month: number) {

    const yearMonth = `${year}-${lpad(month,2,'0')}`

    return db.select({
          date: schedule.date,
          serviceId: booking.serviceId,
          count: sql`cast(count(${booking.id}) as int)`
        }
    ).from(booking).innerJoin(schedule, eq(schedule.id,booking.scheduleId))
        .where(
            and(
                eq(schedule.officeId,officeId),
                isNotNull(booking.visitedAt),
                like(schedule.date,`${yearMonth}%`))
        )
        .groupBy(schedule.date, booking.serviceId)
        .orderBy(schedule.date)

  },


  getActivityReport(from: Date, to: Date): Promise<{id: number, createdAt: string, action: string, parsedAction: { [key: string]: { id: any, label: string } } }[]> {

    const startDate =  formatDate(from)
    to.setDate(to.getDate() + 1);
    const endDate = formatDate(to)

    console.log('GET ACTIVITY REPORT', startDate, endDate)

    // @ts-ignore
    return db.select({
      id: log.id,
      createdAt: log.createdAt,
      action: log.action,
    })
        .from(log)
        .where(
            and(
                gte(log.createdAt, startDate),
                lt(log.createdAt, endDate)
            )
        ).then(res => {
          for (let item of res) {
            // @ts-ignore
            item.parsedAction = parseLogObject(item.action)
          }
          return res
        });
  }
}
