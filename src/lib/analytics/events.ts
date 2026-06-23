import posthog from "posthog-js";

// Canonical client-side event names for the Sprout demo. Keep these stable —
// PostHog funnels, paths, and insights are built against these exact strings.
export const EVENTS = {
  CTA_CLICKED: "cta_clicked",
  PRICING_PLAN_SELECTED: "pricing_plan_selected",
  SURVEY_STARTED: "survey_started",
  SURVEY_STEP_COMPLETED: "survey_step_completed",
  SURVEY_COMPLETED: "survey_completed",
  SURVEY_ABANDONED: "survey_abandoned",
} as const;

export type AppEvent = (typeof EVENTS)[keyof typeof EVENTS];

/** Thin client-side wrapper around posthog.capture for app (non-autocaptured) events. */
export function track(event: AppEvent, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}
