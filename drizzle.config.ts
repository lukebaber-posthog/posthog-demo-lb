import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { getConnectionString } from "./src/lib/db/connection-string";

// Migrations run against the same branch the app uses for this environment:
// prod branch on the production (main) deploy, dev branch on localhost/preview.
export default defineConfig({
  schema: "./src/lib/*/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getConnectionString(),
  },
});
