import { EVENTS, track } from "@/lib/analytics/events";

// PostHog COHORT signal: the "plant people" person property.
//
// Unlike a group, a cohort is a segment of *individual people* — there is no
// shared entity and nothing to aggregate by. Setting this person property lets
// PostHog build a property-based cohort (condition: person.plant_people = true).
export const PLANT_PEOPLE_COHORT_PROPERTY = "plant_people";

/**
 * Tag the current user with the "plant people" person property. The $set payload
 * updates the person's profile on ingestion, so PostHog can place them in the
 * Plant People cohort.
 */
export function optIntoPlantPeople() {
  track(EVENTS.PLANT_PEOPLE_OPTED_IN, {
    $set: { [PLANT_PEOPLE_COHORT_PROPERTY]: true },
  });
}
