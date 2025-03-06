import {defineConfig} from "drizzle-kit";

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./database",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
