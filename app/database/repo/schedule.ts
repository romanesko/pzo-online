import {db} from "@/database/drizzle";

import {and, eq, inArray, type InferSelectModel, ne} from "drizzle-orm";
import assert from "node:assert";
import {handleDBError} from "@/lib/db-exceptions";
import {booking, schedule} from "@/database/schema";
import type {ScheduleItemCombined} from "@/models";


export const scheduleRepo = {
  // getAll: () => {
  //   return db.select().from(schedule).orderBy(schedule.id)
  // },
  add: async (scheduleItem:  InferSelectModel<typeof schedule> ) => {
    return db.insert(schedule).values(scheduleItem).catch(handleDBError)
  },
  update: async (scheduleItem: InferSelectModel<typeof schedule>)=> {
    return db.update(schedule).set(scheduleItem).where(eq(schedule.id, scheduleItem.id)).catch(handleDBError)
  },
  getById: async (id: number)=> {
    assert(id, 'id is required')
    return db.select().from(schedule).where(eq(schedule.id, id)).then(res => res[0])
  },
  // getByOffice(officeId: number) {
  //   return db.select().from(schedule).where(eq(schedule.officeId, officeId)).orderBy(schedule.id)
  // },
  deleteById(id: number) {

    // TODO: check if there are no records in the schedule table

    return db.delete(schedule).where(eq(schedule.id, id)).catch(handleDBError)

  },
  async getByOfficeAndDates(officeId:number, dates: any[]) : Promise<ScheduleItemCombined[]> {
    const items = await db.select().from(schedule)
        .leftJoin(booking, and(eq(booking.scheduleId, schedule.id),ne(booking.state,'canceled')))
        .where(and(eq(schedule.officeId, officeId),inArray(schedule.date, dates))).orderBy(schedule.id)

    return items.map(item => {
      return {
        schedule: item.schedule,
        booking: item.booking?item.booking:undefined,
        offices: undefined,
        locked: undefined
      }
    })


  },
  async copyDate(param: { sourceDate: string; officeId: number; targetDate: string }) {

    if (param.sourceDate == param.targetDate) {
      throw new Error('Нельзя копировать в ту же дату')
    }

    const sourceSchedule = await db.select().from(schedule).where(and(eq(schedule.officeId, param.officeId), eq(schedule.date, param.sourceDate)))

    console.log('sourceSchedule', sourceSchedule)
    if (sourceSchedule.length == 0) {
      throw new Error('Нет событий для копирования')
    }

    // TODO: check if there are no records in the schedule table

    await db.delete(schedule).where(and(eq(schedule.date, param.targetDate), eq(schedule.officeId, param.officeId)))

    const promises = []
    for (let scheduleItem of sourceSchedule) {
      promises.push(db.insert(schedule).values({
        date: param.targetDate,
        startTime: scheduleItem.startTime,
        endTime: scheduleItem.endTime,
        duration: scheduleItem.duration,
        officeId: param.officeId
      }))
    }


    return await Promise.all(promises)

  }
}
