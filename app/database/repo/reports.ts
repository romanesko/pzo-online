import {db} from "@/database/drizzle";
import {booking, schedule} from "@/database/schema";
import {and, eq, sum, isNotNull, like, sql} from "drizzle-orm";
import {lpad} from "@/lib/lpad";


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

  }
}
