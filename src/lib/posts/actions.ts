"use server";

import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, type Post } from "@/lib/db/schema";
import { getPostHogClient } from "@/lib/posthog-server";

const MAX_LENGTH = 1000;

export async function getPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function createPost(formData: FormData): Promise<void> {
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return;

  await db.insert(posts).values({ content: content.slice(0, MAX_LENGTH) });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: "anonymous",
    event: "post_created",
    properties: { content_length: content.length },
  });

  revalidatePath("/");
}
