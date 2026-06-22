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
