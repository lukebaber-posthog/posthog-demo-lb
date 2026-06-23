"use server";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { surveyResponses } from "@/lib/db/schema";

const MAX_LEN = 4000;

type SaveStepArgs = {
  responseId: string;
  step: number; // 1..3
  value: string;
  distinctId?: string;
  completed?: boolean;
};

/**
 * Persist a single survey step into survey_responses, keyed by responseId.
 * Upserts so partial responses accumulate column-by-column as the user answers;
 * unanswered steps simply stay null. The respondent's email is read from the
 * session server-side (null when anonymous); the anonymous PostHog distinct_id
 * is passed from the client so anonymous respondents are still trackable.
 */
export async function saveSurveyStep({
  responseId,
  step,
  value,
  distinctId,
  completed = false,
}: SaveStepArgs): Promise<void> {
  if (!responseId || step < 1 || step > 3) return;

  const { data: session } = await auth.getSession();
  const userEmail = session?.user?.email ?? null;
  const trimmed = value.slice(0, MAX_LEN);

  const stepColumn =
    step === 1 ? { step1: trimmed } : step === 2 ? { step2: trimmed } : { step3: trimmed };

  await db
    .insert(surveyResponses)
    .values({
      responseId,
      distinctId: distinctId ?? null,
      userEmail,
      completed,
      ...stepColumn,
    })
    .onConflictDoUpdate({
      target: surveyResponses.responseId,
      set: {
        ...stepColumn,
        completed,
        userEmail,
        distinctId: distinctId ?? null,
        updatedAt: new Date(),
      },
    });
}
