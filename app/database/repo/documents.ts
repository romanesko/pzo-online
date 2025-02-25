import {document} from "@/database/schema";
import {db} from "@/database/drizzle";
import {count, eq} from "drizzle-orm";
import type {Document} from "@/models";

export const documentsRepo = {
  getAllTitles: () => db.select({id: document.id,name:document.name}).from(document).orderBy(document.id),
  getById: (id: string) => db.select().from(document).where(eq(document.id, id)).then(res => res[0]),
  count: () => db.select({count: count()}).from(document).then(res => res[0].count),
  add:(param: Partial<Document>) =>db.insert(document).values(param as Document).returning().then(a=>a[0]),

  updateContent: (docId: string, content: string)=>db.update(document).set({content}).where(eq(document.id,docId)).returning().then(a=>a[0]),
}
