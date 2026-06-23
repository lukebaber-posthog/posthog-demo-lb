"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { notes, type Note } from "@/lib/db/schema";

const MAX_LENGTH = 2000;

/** The signed-in user's id, or null if not authenticated. */
async function currentUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  return session?.user?.id ?? null;
}

/** Notes belonging to the current user only. Empty when signed out. */
export async function getNotes(): Promise<Note[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));
}

export async function createNote(formData: FormData): Promise<void> {
  // Scope to the authenticated user server-side — never trust a client-supplied id.
  const userId = await currentUserId();
  if (!userId) return;

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await db.insert(notes).values({ userId, content: content.slice(0, MAX_LENGTH) });
  revalidatePath("/notes");
}
