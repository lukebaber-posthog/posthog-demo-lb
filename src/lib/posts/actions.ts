"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, type Post } from "@/lib/db/schema";
import { getPostHogClient } from "@/lib/posthog-server";
import { logger, flushLogs, SeverityNumber } from "@/lib/logger";

const MAX_LENGTH = 1000;
const POSTS_PAGE_SIZE = 10;

type PostsPage = {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Net score = upvotes - downvotes; drives ranking on the board.
const scoreExpr = sql`(${posts.upvotes} - ${posts.downvotes})`;

// Highest-scored posts first, newest as the tie-breaker. Paginated so the board
// never becomes one giant scroll.
export async function getPosts(page = 1): Promise<PostsPage> {
  after(async () => flushLogs());
  const start = Date.now();
  const safePage = Math.max(1, Math.floor(page) || 1);
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts);
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
    const rows = await db
      .select()
      .from(posts)
      .orderBy(desc(scoreExpr), desc(posts.createdAt))
      .limit(POSTS_PAGE_SIZE)
      .offset((safePage - 1) * POSTS_PAGE_SIZE);

    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      body: "posts.list",
      attributes: {
        event: "posts.list",
        status: "success",
        count: rows.length,
        total,
        page: safePage,
        duration_ms: Date.now() - start,
      },
    });
    return { posts: rows, total, page: safePage, pageSize: POSTS_PAGE_SIZE, totalPages };
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

    getPostHogClient().capture({
      distinctId: "anonymous",
      event: "post_created",
      properties: { content_length: content.length },
    });

    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      body: "posts.create",
      attributes: { ...attrs, status: "success", post_id: row.id, duration_ms: Date.now() - start },
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

export async function upvotePost(id: number): Promise<void> {
  await db.update(posts).set({ upvotes: sql`${posts.upvotes} + 1` }).where(eq(posts.id, id));
  revalidatePath("/");
}

export async function downvotePost(id: number): Promise<void> {
  await db.update(posts).set({ downvotes: sql`${posts.downvotes} + 1` }).where(eq(posts.id, id));
  revalidatePath("/");
}
