import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("posts_created_at_idx").on(table.createdAt)],
);

export type Post = typeof posts.$inferSelect;

// Private per-user notes. `userId` holds the Neon Auth user id (a string UUID);
// it's not a FK because auth users live in the managed `neon_auth` schema.
export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("notes_user_id_idx").on(table.userId)],
);

export type Note = typeof notes.$inferSelect;
