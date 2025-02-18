import {drizzle} from 'drizzle-orm/postgres-js';

import postgres from 'postgres';
import {remember} from "@epic-web/remember";

const pool = postgres(process.env.DATABASE_URL as string);

export const db = remember('client', () => drizzle(pool, { logger: true }));

// export const db = drizzle(process.env.DATABASE_URL!);
