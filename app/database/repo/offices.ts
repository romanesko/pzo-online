import {db} from "@/database/drizzle";
import {offices} from "@/database/schema";
import {eq, type InferSelectModel} from "drizzle-orm";
import assert from "node:assert";


export const officesRepo = {
  getAll: () => {
    return db.select().from(offices).orderBy(offices.id)
  },
  add: async (office:  InferSelectModel<typeof offices> ) => {
    console.log('add', office)
    return db.insert(offices).values(office)
  },
  update: async(office: InferSelectModel<typeof offices>)=> {
    return db.update(offices).set(office).where(eq(offices.id, office.id))
  },
  getById: async(id: number) => {
    assert(id, 'id is required')
    return db.select().from(offices).where(eq(offices.id, id)).then(res => res[0])

  }
}
