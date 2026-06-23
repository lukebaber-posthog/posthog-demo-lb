ALTER TABLE "posts" ADD COLUMN "upvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "downvotes" integer DEFAULT 0 NOT NULL;