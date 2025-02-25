import {db} from "@/database/drizzle";
import {service} from "@/database/schema";
import {eq} from "drizzle-orm";


export const servicesRepo = {
  getAll: () => db.select().from(service).orderBy(service.id),
  getById : (serviceId: number) =>db.select().from(service).where(eq(service.id,serviceId)).then(res => res[0])
}
