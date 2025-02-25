import {db} from "@/database/drizzle";
import {booking, clients, offices, schedule, service} from "@/database/schema";
import {and, asc, desc, eq, gte, ne, sql} from "drizzle-orm";
import assert from "node:assert";
import type {Booking, ScheduleItemCombined} from "@/models";
import {handleDBError} from "@/lib/db-exceptions";
import {logRepo} from "@/database/repo/log";


export interface RecordsResponse {

  booking: {
    id: number,
        createdAt: string,
        state: string,
  },
  schedule: {
    id: number,
        date: string,
        startTime: string,
        endTime: string,
        duration: number,
  },
  client: {
    id: number,
        firstName: string | null,
        lastName: string | null,
        middleName: string | null,
        phone: string,
  }

}

export const bookingRepo = {
  getAll: () => {
    return db.select().from(booking).orderBy(booking.id)
  },
  add: async (rec: { slotId: number,  clientId: number, serviceId:number }, createdBy: number): Promise<Booking> => {
    const data =  await db.insert(booking).values({
      scheduleId: rec.slotId,
      createdBy: createdBy,
      clientId: rec.clientId,
      state: 'pending',
      serviceId: rec.serviceId
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
  getComposed: async (id: number) : Promise<ScheduleItemCombined> => {
    assert(id, 'id is required')
    return db.select().from(booking)
        .innerJoin(schedule, eq(booking.scheduleId, schedule.id))
        .leftJoin(offices, eq(schedule.officeId, offices.id))
        .where(eq(booking.id, id)).then(res => res[0]) as any as ScheduleItemCombined
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
  },
  async findActual(officeId: number) : Promise<RecordsResponse[]> {
    const today = await db.execute(sql`SELECT NOW()::date::text`).then(r=>r[0].now as string);

    return db.select({
      booking: {
        id: booking.id,
        createdAt: booking.createdAt,
        state: booking.state,
        visitedAt: booking.visitedAt
      },
      schedule: {
        id: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        duration: schedule.duration,
      },
      client: {
        id: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        middleName: clients.middleName,
        phone: clients.phoneNumber,
      },
      service: {
        id: booking.serviceId,
        name: service.name,
        basePrice: service.basePrice
      }
    }).from(booking)
        .innerJoin(schedule, and(eq(booking.scheduleId, schedule.id),ne(booking.state,'canceled')))
        .innerJoin(clients, and(eq(booking.clientId, clients.id)))
        .innerJoin(service, and(eq(booking.serviceId, service.id)))
        .where(and(
            eq(schedule.officeId, officeId),
            gte(schedule.date,today)
        )).orderBy(asc(schedule.date), asc(schedule.startTime))

  },


  async switchVisit(bookingId: number) {
    const current = await this.getById(bookingId);


    return db.update(booking)
        .set({ visitedAt: current.visitedAt?null:sql`NOW()` })
        .where(eq(booking.id,bookingId));


  }

}
