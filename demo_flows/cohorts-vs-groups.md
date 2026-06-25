# Cohorts vs Groups — demo flow

A walkthrough for showing the difference between a PostHog **cohort** and a PostHog **group**, using the Sprout app.

**The one-line distinction:** a cohort is a saved segment of *people* (who they are or what they did). A group is a separate *entity* — here a **Garden** — that events roll up to, so you can analyze the garden as the unit instead of the user. A cohort filters *which people*; a group changes *what you count*.

PostHog project: **Sprout Demo** (`452081`, PostHog Inc).

---

## 1. Set up the data

```bash
npm run dev          # app on http://localhost:3000
npm run seed         # drives ~headless journeys → real PostHog events
# fuller dataset: USER_COUNT=40 CONCURRENCY=6 npm run seed
```

Each seeded user signs up, **joins one of four gardens**, and then posts / surveys / votes — so that activity rolls up to their garden. About 40% also opt into the Plant People cohort, and some users post 3+ times (so the behavioral cohort has members).

> The seed must run against the live dev server, and it spoofs the headless-browser fingerprint so posthog-js doesn't drop the events. If the server isn't up, the run will no-op.

---

## 2. Show it in the app (~1 min)

Sign in, then click **Community** in the nav (`/join`). The page splits the two ideas on purpose:

- **Join a Garden · group** — pick one of four gardens (The Oasis, Fernwood Collective, Succulent Squad, Mossy Bottom, each with a `plan` and `region`). This calls `posthog.group("garden", <key>, {...})`, so every later event carries `$groups.garden`.
- **Opt into Plant People · cohort** — sets the person property `plant_people = true`. No shared entity, just a tag on the individual.

---

## 3. Groups — analyze by the garden

In PostHog, the gardens live under group type `garden` (group_type_index **2**). Two saved insights make the point:

- **[Active gardens vs active users](https://us.posthog.com/project/452081/insights/u1MmuuJ2)** — the same activity counted two ways: ~4 active gardens vs ~117 active users. Only a group lets you make the garden the unit of analysis. A cohort can never be "counted" this way; it only ever filters people.
- **[Posts by garden plan](https://us.posthog.com/project/452081/insights/ex2TnD9N)** — `post_submitted` broken down by the garden's `plan` property (free vs pro). You're breaking down by an attribute that lives on the shared entity, which a cohort has no way to express.

Talking point: a garden has its own properties and many members, and you'd ask "how many gardens are active / how do gardens compare." That question doesn't exist for a cohort.

---

## 4. Cohorts — segments of individuals

Under **People → Cohorts**:

- **Plant people** — person property `plant_people = true` (~13 members). A property segment of users.
- **Power growers** — behavioral: posted on the board 3+ times in the last 30 days. This is the part groups can't do — membership defined by *behavior over time*. (Behavioral cohorts recalc on a schedule, so the count can lag a fresh seed; open the cohort to force calculation.)

Talking point: both are answers to "which users," and you'd drop either into an insight filter, a flag, a survey, or a replay playlist. Neither is an entity you can aggregate by.

---

## 5. When to reach for which

| Use a **cohort** when… | Use a **group** when… |
|---|---|
| You want a segment of users (by trait or behavior) | You want to analyze a shared entity (company, team, garden) |
| The unit is the person | The unit should be the entity, not the person |
| Membership is behavioral or property-based | The entity carries its own properties shared by members |
| You need it in replay filters, flag targeting, surveys | You need "active gardens", per-garden funnels, per-plan breakdowns |

For a single "plant people" community, a cohort is the right tool. Gardens earn their keep precisely because there are *many* of them, each with members and properties you compare.

---

## What feeds what (cheat sheet)

| Action in app | Sends | Shows up as |
|---|---|---|
| Join a Garden | `posthog.group("garden", key, {name,plan,region})` + `garden_joined` | `garden` group (index 2), garden insights |
| Opt into Plant People | `$set plant_people = true` (+ `plant_people_opted_in`) | Plant people cohort |
| Post on the board | `post_submitted` (rolls up to the joined garden) | Power growers cohort + per-garden insights |
