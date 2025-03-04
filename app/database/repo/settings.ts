import {settings} from "@/database/schema";
import {db} from "@/database/drizzle";
import {eq} from "drizzle-orm";


export class Settings {
  FIRST_SLOT: string = '09:00'
  LAST_SLOT: string = '20:00'
  SLOT_STEP: number = 5
  DEFAULT_CALENDAR_DAYS: number = 7
}

function getValue(key: string): Promise<string | undefined> {
  return db.select().from(settings).where(eq(settings.key, key)).then(a => a[0]).then(a => a?.value)
}



export const settingsRepo = {
  get: async () => {
    const rows = await db.select().from(settings)

    const currentSettings = new Settings()

    rows.forEach((row) => {
      const key = row.key

        if (Object.prototype.hasOwnProperty.call(currentSettings, key)) {
          const value = row.value;
          // @ts-ignore
          const propertyType = typeof currentSettings[key];

          switch (propertyType) {
            case 'string':
              // @ts-ignore
              currentSettings[key as keyof Settings] = String(value);
              break;
            case 'number':
              // @ts-ignore
              currentSettings[key as keyof Settings] = Number(value);
              break;
            case 'boolean':
              // @ts-ignore
              currentSettings[key as keyof Settings] = Boolean(value);
              break;
            default:
              // @ts-ignore
              currentSettings[key as keyof Settings] = value;
          }

      }
    });

    return currentSettings

  },
  set: async (set: Settings) => {

    for (const key of Object.keys(set)) {
      // @ts-ignore
      const valToInsert = set[key];
      await db.update(settings).set({value: valToInsert}).where(eq(settings.key, key))
    }
  }


}

// insert default settings
const defSettings = new Settings()
for (const key of Object.keys(defSettings)) {
  const value = await getValue(key)
  if (!value) {
    // @ts-ignore
    const valToInsert = defSettings[key];
    await db.insert(settings).values({key, value: valToInsert})
  }
}



