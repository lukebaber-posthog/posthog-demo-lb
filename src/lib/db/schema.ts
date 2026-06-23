import { pgTable, serial, text, timestamp, index, integer, boolean } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
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

// Captured survey responses — one row per survey session (response_id), upserted
// as each step is answered. Respondent is tracked by email when signed in and by
// PostHog distinct_id when anonymous. A step column stays null if never answered.
export const surveyResponses = pgTable(
  "survey_responses",
  {
    id: serial("id").primaryKey(),
    responseId: text("response_id").notNull().unique(),
    distinctId: text("distinct_id"),
    userEmail: text("user_email"),
    step1: text("step_1"),
    step2: text("step_2"),
    step3: text("step_3"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("survey_responses_distinct_id_idx").on(table.distinctId)],
);

export type SurveyResponse = typeof surveyResponses.$inferSelect;
