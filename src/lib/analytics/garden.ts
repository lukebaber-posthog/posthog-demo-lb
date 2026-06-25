import posthog from "posthog-js";
import { EVENTS, track } from "@/lib/analytics/events";

// PostHog GROUP analytics: the "Garden" shared space.
//
// A group is a non-person entity (here, a garden) that many users belong to and
// that events roll up to. The group TYPE is the category ("garden"); each KEY is
// one specific garden. Calling posthog.group() associates the current user's
// subsequent events with the garden (via $groups.garden) and emits a
// $groupidentify event carrying the garden's properties — so you can aggregate
// and break down by the garden as a unit.
export const GARDEN_GROUP_TYPE = "garden";

export type Garden = {
  key: string;
  name: string;
  plan: "free" | "pro";
  region: "us" | "eu";
};

// Several gardens with distinct properties so group breakdowns are interesting.
export const GARDENS: Garden[] = [
  { key: "garden_oasis", name: "The Oasis", plan: "pro", region: "us" },
  { key: "garden_fernwood", name: "Fernwood Collective", plan: "free", region: "eu" },
  { key: "garden_succulent_squad", name: "Succulent Squad", plan: "pro", region: "eu" },
  { key: "garden_mossy_bottom", name: "Mossy Bottom", plan: "free", region: "us" },
];

export function gardenByKey(key: string): Garden | undefined {
  return GARDENS.find((g) => g.key === key);
}

/**
 * Associate the current user with a garden (a PostHog group). All of the user's
 * subsequent events roll up to this garden via $groups.garden, and a
 * $groupidentify event carries the garden's properties (name, plan, region).
 */
export function joinGarden(key: string) {
  const garden = gardenByKey(key);
  if (!garden) return;
  posthog.group(GARDEN_GROUP_TYPE, garden.key, {
    name: garden.name,
    plan: garden.plan,
    region: garden.region,
  });
  track(EVENTS.GARDEN_JOINED, { garden: garden.key });
}
