import {db} from "@/database/drizzle";
import {clients} from "@/database/schema";
import {eq, type InferSelectModel, like} from "drizzle-orm";
import assert from "node:assert";
import {handleDBError} from "@/lib/db-exceptions";
import type {Client} from "@/models";
import {formatPhoneNumber} from "@/lib/common";


export const clientsRepo = {
  getAll: () => {
    return db.select().from(clients).orderBy(clients.id)
  },
  add: async (client:  Client) => {
    client.phoneNumber = formatPhoneNumber(client.phoneNumber)
    return db.insert(clients).values(client).returning().then(a=>a[0]).catch(handleDBError)
  },
  update: async (client: InferSelectModel<typeof clients>)=> {
    return db.update(clients).set(client).where(eq(clients.id, client.id)).catch(handleDBError)
  },
  getById: async (id: number)=> {
    assert(id, 'id is required')
    return db.select().from(clients).where(eq(clients.id, id)).then(res => res[0])

  },
  findByPhone(phone: string, limit: number = 10) : Promise<Client[]> {
    return db.select().from(clients).where(like(clients.phoneNumber, '%'+phone+'%')).limit(limit)

  }
}
