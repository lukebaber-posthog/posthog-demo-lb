"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, type Post } from "@/lib/db/schema";
import { getPostHogClient } from "@/lib/posthog-server";
import { logger, flushLogs, SeverityNumber } from "@/lib/logger";

const MAX_LENGTH = 1000;

export async function getPosts(): Promise<Post[]> {
  after(async () => flushLogs());
  const start = Date.now();
  try {
    const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      body: "posts.list",
      attributes: {
        event: "posts.list",
        status: "success",
        count: rows.length,
        duration_ms: Date.now() - start,
      },
    });
    return rows;
  } catch (err) {
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: "ERROR",
      body: "posts.list",
      attributes: {
        event: "posts.list",
        status: "failed",
        error_type: err instanceof Error ? err.name : "unknown",
        duration_ms: Date.now() - start,
      },
    });
    throw err;
  }
}

export async function createPost(formData: FormData): Promise<void> {
  after(async () => flushLogs());
  const start = Date.now();
  const content = String(formData.get("content") ?? "").trim();

  // One wide event accumulated across the request (best-practice structured log).
  const attrs: Record<string, string | number | boolean> = {
    event: "posts.create",
    content_length: content.length,
  };

  if (!content) {
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: "WARN",
      body: "posts.create",
      attributes: { ...attrs, status: "rejected", reason: "empty_content" },
    });
    return;
  }

  try {
    const [row] = await db
      .insert(posts)
      .values({ content: content.slice(0, MAX_LENGTH) })
      .returning({ id: posts.id });

    // Analytics event ("what the user did") — distinct from the system log below.
    getPostHogClient().capture({
      distinctId: "anonymous",
      event: "post_created",
      properties: { content_length: content.length },
    });

    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      body: "posts.create",
      attributes: {
        ...attrs,
        status: "success",
        post_id: row.id,
        duration_ms: Date.now() - start,
      },
    });

    revalidatePath("/");
  } catch (err) {
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: "ERROR",
      body: "posts.create",
      attributes: {
        ...attrs,
        status: "failed",
        error_type: err instanceof Error ? err.name : "unknown",
        duration_ms: Date.now() - start,
      },
    });
    throw err;
  }
}
