import {db} from "@/database/drizzle";
import {service} from "@/database/schema";
import {eq} from "drizzle-orm";
import type {Service} from "@/models";


export const servicesRepo = {
  getAll: () => db.select().from(service).orderBy(service.id),
  getById : (serviceId: number) =>db.select().from(service).where(eq(service.id,serviceId)).then(res => res[0]),
  update: (s: Service)=> db.update(service).set(s).where(eq(service.id, s.id)),
  add: (s: { documents: string[]; name: string; basePrice: number })=>  db.insert(service).values(s)
}
