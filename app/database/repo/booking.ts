import {db} from "@/database/drizzle";
import {booking, offices, schedule} from "@/database/schema";
import {and, desc, eq, ne} from "drizzle-orm";
import assert from "node:assert";
import type {Booking, ScheduleItemCombined} from "@/models";
import {handleDBError} from "@/lib/db-exceptions";
import {logRepo} from "@/database/repo/log";


export const bookingRepo = {
  getAll: () => {
    return db.select().from(booking).orderBy(booking.id)
  },
  add: async (rec: { slotId: number,  clientId: number }, createdBy: number): Promise<Booking> => {
    const data =  await db.insert(booking).values({
      scheduleId: rec.slotId,
      createdBy: createdBy,
      clientId: rec.clientId,
      state: 'pending',
    } as any).returning().then(a => a[0]).catch(handleDBError)

    logRepo.addBooking({userId: createdBy, booking: data} )

    return data

  },
  // update: async (rec: Booking) => {
  //   return db.update(booking).set(rec).where(eq(booking.id, rec.id))
  // },
  getById: async (id: number) => {
    assert(id, 'id is required')
    return db.select().from(booking).where(eq(booking.id, id)).then(res => res[0])

  },
  async updateState({bookingId, state}: {bookingId: number, state: "pending" | "confirmed" | "canceled"}, updatedBy: number) {
    const data = await db.update(booking).set({state}).where(eq(booking.id, bookingId)).returning().then(a => a[0]).catch(handleDBError)

    if(state == 'canceled') {
      logRepo.cancelBooking({userId: updatedBy, booking: data} )
    } else if(state == 'confirmed') {
      logRepo.confirmBooking({userId: updatedBy, booking: data} )
    } else if(state == 'pending') {
      logRepo.cancelConfirmBooking({userId: updatedBy, booking: data} )
    }
    return data

  },
  findByClient(clintId:number): Promise<ScheduleItemCombined[]> {
    return db.select().from(booking)
        .innerJoin(schedule, and(eq(booking.scheduleId, schedule.id),ne(booking.state,'canceled')))
        .innerJoin(offices, and(eq(schedule.officeId, offices.id)))
        .where(and(eq(booking.clientId, clintId))).orderBy(desc(schedule.date))
  }
}
