import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DB_DATABASE_URL) {
  throw new Error("DB_DATABASE_URL is not set in the .env file");
}

export default defineConfig({
  schema: "./src/lib/*/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_DATABASE_URL,
  },
});
