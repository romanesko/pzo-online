import {db} from "@/database/drizzle";
import {log, users} from "@/database/schema";
import {handleDBError} from "@/lib/db-exceptions";
import assert from "node:assert";
import type {Booking} from "@/models";
import {repo} from "@/database/repo/index";
import {and, desc, eq, like, ne, SQL, sql} from "drizzle-orm";
import type {AnyPgColumn} from "drizzle-orm/pg-core";

function wrap(obj: any) {
  return `{{${JSON.stringify(obj)}}}`
}

async function getBookingInfo(booking: Booking) {
  assert(booking.id, 'booking.id is required')
  const client = await repo.clients.getById(booking.clientId)
  const schedule = await repo.schedule.getById(booking.scheduleId)
  const office = await repo.offices.getById(schedule.officeId)
  const bookingObj = asType('booking', booking.id.toString(), booking.id)
  const scheduleObj = asType('schedule', `${schedule.date} ${schedule.startTime}`, schedule.id)
  const officeObj = asType('office', office.name, office.id)
  const clientObj = {
    type: 'client',
    id: client.id,
    label: `${client.lastName||''} ${client.firstName||''} ${client.middleName||''}`
  }
  return {bookingObj, scheduleObj, officeObj, clientObj}
}

const asType = (type:string, label:string, id: any)=>(  {type: type, id: id, label: label})



export const logRepo = {
  addBooking: async ({userId, booking}: { userId: number, booking: Booking }) => {
    assert(userId, 'userId is required')
    const {bookingObj, scheduleObj, officeObj, clientObj} = await getBookingInfo(booking)

    const action = asType('action', 'Добавлена запись', 'ADD')

    const msg = `${wrap(action)} на приём ${wrap(bookingObj)} на ${wrap(scheduleObj)} в клинику «${wrap(officeObj)}» для клиента ${wrap(clientObj)}`
    return db.insert(log).values({userId, action: msg}).catch(handleDBError)
  },

  confirmBooking: async ({userId, booking}: { userId: number, booking: Booking }) => {
    assert(userId, 'userId is required')
    const {bookingObj, scheduleObj, officeObj, clientObj} = await getBookingInfo(booking)
    const action = asType('action', 'Подтверждена запись', "CONFIRM")
    const msg = `${wrap(action)} на приём ${wrap(bookingObj)} на ${wrap(scheduleObj)} в клинику «${wrap(officeObj)}» для клиента ${wrap(clientObj)}`
    return db.insert(log).values({userId, action: msg}).catch(handleDBError)
  },

  cancelConfirmBooking: async ({userId, booking}: { userId: number, booking: Booking }) => {
    assert(userId, 'userId is required')
    const {bookingObj, scheduleObj, officeObj, clientObj} = await getBookingInfo(booking)
    const action = asType('action', 'Отменено подтверждение', "CONFIRM_CANCEL")
    const msg = `${wrap(action)} на приём ${wrap(bookingObj)} на ${wrap(scheduleObj)} в клинику «${wrap(officeObj)}» для клиента ${wrap(clientObj)}`
    return db.insert(log).values({userId, action: msg}).catch(handleDBError)
  },

  cancelBooking: async ({userId, booking}: { userId: number, booking: Booking }) => {
    assert(userId, 'userId is required')
    const {bookingObj, scheduleObj, officeObj, clientObj} = await getBookingInfo(booking)
    const action = asType('action', 'Отменена запись', "CANCEL")
    const msg = `${wrap(action)} на приём ${wrap(bookingObj)} на ${wrap(scheduleObj)} в клинику «${wrap(officeObj)}» для клиента ${wrap(clientObj)}`
    return db.insert(log).values({userId, action: msg}).catch(handleDBError)
  },


  async getLatest(filter: string | null, userId: number | null,number: number) {



    return db.select().from(log).innerJoin(users, eq(log.userId, users.id))
        .where(and(
            userId ? eq(log.userId, userId) : ne(log.userId, 0),
            like(lower(log.action), `%${filter||''}%`.toLowerCase())))

        .orderBy(desc(log.id)).limit(number)
  }
}


function lower(field: AnyPgColumn): SQL {
  return sql`lower(${field})`;
}
