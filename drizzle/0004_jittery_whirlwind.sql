CREATE TABLE IF NOT EXISTS "survey_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"response_id" text NOT NULL,
	"distinct_id" text,
	"user_email" text,
	"step_1" text,
	"step_2" text,
	"step_3" text,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "survey_responses_response_id_unique" UNIQUE("response_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "survey_responses_distinct_id_idx" ON "survey_responses" USING btree ("distinct_id");