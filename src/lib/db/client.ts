import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import * as dbSchema from "@/lib/db/schema";
import { getConnectionString } from "./connection-string";

// Connection string is chosen per environment: prod branch on the main/production
// deploy, dev branch on localhost and preview branches.
const pool = new Pool({
  connectionString: getConnectionString(),
});

// Attach to Vercel's serverless function pool (for Vercel deployments)
attachDatabasePool(pool);

// Create Drizzle instance with the pool and app schema (auth tables are
// managed by Neon Auth in the `neon_auth` schema, not by Drizzle)
export const db = drizzle(pool, { schema: { ...dbSchema } });

// Database connection check function
export async function checkDbConnection(): Promise<string> {
  try {
    await pool.query("SELECT version()");
    return "Database connected";
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return "Database not connected";
  }
}
