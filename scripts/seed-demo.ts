/**
 * seed-demo.ts — drives real headless browser sessions against the running
 * Sprout demo app to generate realistic PostHog demo data.
 *
 * Run with bun:
 *   bun run scripts/seed-demo.ts
 *
 * Env vars (all optional, with defaults):
 *   BASE_URL              base url of the running app   (default http://localhost:3000)
 *   USER_COUNT            number of journeys to run     (default 20)
 *   START_INDEX           explicit starting test index  (overrides DB detection)
 *   AUTH_DATABASE_URL     Postgres url for detecting existing test users
 *   SURVEY_START_RATE     prob a user starts the survey (default 0.8)
 *   SURVEY_COMPLETE_RATE  prob a starter completes it   (default 0.45)
 *   POST_RATE             prob a user creates a post    (default 0.5)
 *   CONCURRENCY           parallel journeys             (default 4)
 *   HEADLESS              "false" to show the browser   (default headless)
 */

import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { Client } from "pg";

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const USER_COUNT = parseInt(process.env.USER_COUNT ?? "20", 10);
const SURVEY_START_RATE = parseFloat(process.env.SURVEY_START_RATE ?? "0.8");
const SURVEY_COMPLETE_RATE = parseFloat(process.env.SURVEY_COMPLETE_RATE ?? "0.45");
const POST_RATE = parseFloat(process.env.POST_RATE ?? "0.5");
const VOTE_RATE = parseFloat(process.env.VOTE_RATE ?? "0.6");
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? "4", 10);
const HEADLESS = process.env.HEADLESS !== "false";

const PASSWORD = "1234567890";
const ACTION_TIMEOUT = 15_000;

// ── Small helpers ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const chance = (p: number) => Math.random() < p;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const POST_LINES = [
  "Just trying out Sprout — looks clean so far.",
  "Anyone else loving the new dashboards?",
  "Hello from the message board!",
  "Quick note: surveys are surprisingly easy to set up.",
  "Testing things out, ignore me.",
  "Session replay saved me a ton of debugging time.",
];

const SURVEY_TEXT_LINES = [
  "Faster onboarding would be great.",
  "More dashboard templates please.",
  "Better mobile support, otherwise solid.",
  "Love it, maybe add dark mode everywhere.",
  "An export-to-CSV button would help a lot.",
];

/** Click a selector if present within a short timeout, else fall through. */
async function clickIfPresent(page: Page, selector: string, timeout = 2_000): Promise<boolean> {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout });
    await el.click({ timeout: ACTION_TIMEOUT });
    return true;
  } catch {
    return false;
  }
}

// ── Starting index detection ───────────────────────────────────────────────────

/**
 * Decide which test{N} index to start at:
 *   1. START_INDEX env wins.
 *   2. else AUTH_DATABASE_URL: query existing test users, start at max+1.
 *   3. else default to 1. Any DB error falls back to 1.
 */
async function resolveStartIndex(): Promise<number> {
  if (process.env.START_INDEX) {
    const n = parseInt(process.env.START_INDEX, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }

  const dbUrl = process.env.AUTH_DATABASE_URL;
  if (!dbUrl) return 1;

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    const res = await client.query(
      `SELECT email FROM neon_auth."user" WHERE email LIKE 'test%@email.com'`
    );
    let max = 0;
    for (const row of res.rows as Array<{ email: string }>) {
      const m = /^test(\d+)@email\.com$/.exec(row.email);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    return max + 1;
  } catch (err) {
    console.warn(`[seed] DB detection failed, defaulting start index to 1: ${(err as Error).message}`);
    return 1;
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

// ── Journey result tracking ─────────────────────────────────────────────────────

type SurveyOutcome = "completed" | "dropped" | "skipped";

type JourneyResult = {
  index: number;
  signedUp: boolean;
  surveyStarted: boolean;
  surveyOutcome: SurveyOutcome;
  posted: boolean;
};

const stats = {
  signedUp: 0,
  surveysStarted: 0,
  surveysCompleted: 0,
  droppedAtStep4: 0,
  posts: 0,
  votes: 0,
};

// ── Journey steps ───────────────────────────────────────────────────────────────

/** Step 2: randomized exploration of /about and /pricing via nav links. */
async function explore(page: Page): Promise<void> {
  let targets: Array<{ route: string; testid: string }> = [
    { route: "/about", testid: "nav-about" },
    { route: "/pricing", testid: "nav-pricing" },
  ];
  targets = shuffle(targets);
  // ~30% of users skip one of the two pages.
  if (chance(0.3)) targets = targets.slice(0, 1);

  for (const t of targets) {
    const clicked = await clickIfPresent(page, `[data-testid=${t.testid}]`);
    if (!clicked) {
      await page.goto(`${BASE_URL}${t.route}`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
    }
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await sleep(600);
  }
}

/** Step 3: from /pricing, ~60% click a plan CTA (navigates to /sign-up), rest goto. */
async function reachSignUp(page: Page): Promise<void> {
  // Ensure we're on /pricing so a plan CTA is available.
  if (!page.url().includes("/pricing")) {
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT }).catch(() => {});
    await sleep(400);
  }

  let navigated = false;
  if (chance(0.6)) {
    const ctas = page.locator("[data-testid=plan-cta]");
    try {
      const count = await ctas.count();
      if (count > 0) {
        await ctas.nth(Math.floor(Math.random() * count)).click({ timeout: ACTION_TIMEOUT });
        await page.waitForURL("**/sign-up", { timeout: ACTION_TIMEOUT }).catch(() => {});
        navigated = page.url().includes("/sign-up");
      }
    } catch {
      /* fall through to goto */
    }
  }

  if (!navigated) {
    await page.goto(`${BASE_URL}/sign-up`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
  }
}

/**
 * Step 4: fill and submit the sign-up form. On an "already exists" error,
 * bump to the next free index and retry once. Returns the index actually used.
 */
async function signUp(page: Page, index: number, takeNextIndex: () => number): Promise<number> {
  let currentIndex = index;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (!page.url().includes("/sign-up")) {
      await page.goto(`${BASE_URL}/sign-up`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
    }

    // Wait for the form to mount and React to hydrate before filling. On a soft
    // (client-side) navigation the controlled inputs can otherwise be reset during
    // hydration, discarding the typed values and producing a failed submit.
    await page.waitForSelector("#email", { state: "visible", timeout: ACTION_TIMEOUT });
    await page.waitForLoadState("networkidle", { timeout: ACTION_TIMEOUT }).catch(() => {});
    await sleep(500);

    const email = `test${currentIndex}@email.com`;
    await page.fill("#name", `test${currentIndex}`, { timeout: ACTION_TIMEOUT });
    await page.fill("#email", email, { timeout: ACTION_TIMEOUT });
    await page.fill("#password", PASSWORD, { timeout: ACTION_TIMEOUT });
    // Re-fill if hydration reset the controlled values.
    if ((await page.locator("#email").inputValue().catch(() => "")) !== email) {
      await page.fill("#name", `test${currentIndex}`, { timeout: ACTION_TIMEOUT });
      await page.fill("#email", email, { timeout: ACTION_TIMEOUT });
      await page.fill("#password", PASSWORD, { timeout: ACTION_TIMEOUT });
    }
    await page.click('button[type="submit"]', { timeout: ACTION_TIMEOUT });

    // Either we navigate home, or an error div appears.
    const errorDiv = page.locator("div.text-red-500").first();
    try {
      await Promise.race([
        page.waitForURL((url) => new URL(url).pathname === "/", { timeout: ACTION_TIMEOUT }),
        errorDiv.waitFor({ state: "visible", timeout: ACTION_TIMEOUT }),
      ]);
    } catch {
      // Fall back to networkidle as a settle point.
      await page.waitForLoadState("networkidle", { timeout: ACTION_TIMEOUT }).catch(() => {});
    }

    // Success: we ended up back on home.
    if (new URL(page.url()).pathname === "/") {
      return currentIndex;
    }

    // Error visible (likely "user already exists") → grab a fresh index, retry once.
    const hasError = await errorDiv.isVisible().catch(() => false);
    if (hasError && attempt === 0) {
      currentIndex = takeNextIndex();
      continue;
    }

    break;
  }

  // Best effort: leave whatever index we last attempted.
  return currentIndex;
}

/**
 * Run the survey (2 questions + a long-form story). Returns the outcome.
 * Completers type the step-3 long-form answer and finish; drop-offs reach
 * step 3 but won't type it (the intended funnel drop at the long-form step).
 */
async function runSurvey(page: Page): Promise<SurveyOutcome> {
  if (!chance(SURVEY_START_RATE)) return "skipped";

  await page.goto(`${BASE_URL}/survey`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
  await page.waitForLoadState("networkidle", { timeout: ACTION_TIMEOUT }).catch(() => {});

  const startBtn = page.locator("[data-testid=survey-start]");
  try {
    await startBtn.waitFor({ state: "visible", timeout: ACTION_TIMEOUT });
  } catch {
    return "skipped";
  }
  // Let the client component hydrate before clicking, otherwise the onClick is
  // dropped and the survey never leaves the intro screen. Retry once.
  await sleep(700);
  let onStep1 = false;
  for (let attempt = 0; attempt < 2 && !onStep1; attempt++) {
    await startBtn.click({ timeout: ACTION_TIMEOUT }).catch(() => {});
    onStep1 = await page
      .locator("[data-testid=survey-option]")
      .first()
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!onStep1) await sleep(500);
  }
  if (!onStep1) return "skipped";
  stats.surveysStarted++;

  // Select an option/rating, wait for React to register it (aria-pressed), then
  // click the advance button — this defeats the hydration/timing race.
  const selectAndAdvance = async (
    selectSelector: string,
    advanceSelector: string,
    randomIndex = false,
  ): Promise<void> => {
    const opts = page.locator(selectSelector);
    const count = await opts.count().catch(() => 0);
    if (count === 0) return;
    const idx = randomIndex ? Math.floor(Math.random() * count) : 0;
    await opts.nth(idx).click({ timeout: ACTION_TIMEOUT });
    await page
      .locator(`${selectSelector}[aria-pressed="true"]`)
      .first()
      .waitFor({ state: "visible", timeout: 5_000 })
      .catch(() => {});
    await page.locator(advanceSelector).click({ timeout: ACTION_TIMEOUT });
    await sleep(250);
  };

  // Step 1 — choice, Step 2 — rating.
  await selectAndAdvance("[data-testid=survey-option]", "[data-testid=survey-next]");
  await selectAndAdvance("[data-testid=survey-rating]", "[data-testid=survey-next]", true);

  // Step 3 — long-form text (the friction / drop-off point). Confirm we reached it.
  const textField = page.locator("[data-testid=survey-text]");
  const atLongForm = await textField
    .waitFor({ state: "visible", timeout: ACTION_TIMEOUT })
    .then(() => true)
    .catch(() => false);
  if (!atLongForm) return "dropped";

  if (!chance(SURVEY_COMPLETE_RATE)) {
    // Intended drop-off: reached the long-form step, but won't type it out.
    await sleep(1000);
    return "dropped";
  }

  await textField.fill(pick(SURVEY_TEXT_LINES), { timeout: ACTION_TIMEOUT });
  // Step 3 is the last step → Finish.
  await page.locator("[data-testid=survey-finish]").click({ timeout: ACTION_TIMEOUT });

  return await page
    .locator("[data-testid=survey-complete]")
    .first()
    .waitFor({ state: "visible", timeout: ACTION_TIMEOUT })
    .then(() => "completed" as const)
    .catch(() => "dropped" as const);
}

/** Step 6: optionally create a post on the home message board. */
async function maybePost(page: Page): Promise<boolean> {
  if (!chance(POST_RATE)) return false;

  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
  try {
    await page.fill('textarea[name="content"]', pick(POST_LINES), { timeout: ACTION_TIMEOUT });
    await page.getByRole("button", { name: "Post" }).first().click({ timeout: ACTION_TIMEOUT });
    await sleep(800);
    return true;
  } catch {
    return false;
  }
}

/** Optionally cast a few up/down votes on the board so posts get ranked. */
async function maybeVote(page: Page): Promise<number> {
  if (!chance(VOTE_RATE)) return 0;

  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
  await page.waitForLoadState("networkidle", { timeout: ACTION_TIMEOUT }).catch(() => {});

  const ups = page.locator("[data-testid=post-upvote]");
  const downs = page.locator("[data-testid=post-downvote]");
  const count = await ups.count().catch(() => 0);
  if (count === 0) return 0;

  const numVotes = 1 + Math.floor(Math.random() * 3); // 1–3 votes
  let cast = 0;
  for (let i = 0; i < numVotes; i++) {
    const idx = Math.floor(Math.random() * count);
    try {
      // Mostly upvotes, some downvotes → score variation drives ranking.
      if (chance(0.7)) await ups.nth(idx).click({ timeout: ACTION_TIMEOUT });
      else await downs.nth(idx).click({ timeout: ACTION_TIMEOUT });
      cast++;
      await sleep(300);
    } catch {
      /* a re-render shifted the list — just move on */
    }
  }
  return cast;
}

// ── One full journey ─────────────────────────────────────────────────────────────

async function runJourney(
  browser: Browser,
  index: number,
  total: number,
  position: number,
  takeNextIndex: () => number
): Promise<JourneyResult> {
  const result: JourneyResult = {
    index,
    signedUp: false,
    surveyStarted: false,
    surveyOutcome: "skipped",
    posted: false,
  };

  // Each user gets their own context → distinct anonymous PostHog distinct_id.
  // Disguise the headless-automation fingerprint (userAgent, userAgentData.brands,
  // navigator.webdriver) — otherwise posthog-js classifies the session as a bot
  // and silently drops every client-side event (pageviews, survey, signup, etc.).
  const context: BrowserContext = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    try {
      Object.defineProperty(navigator, "userAgentData", {
        configurable: true,
        get: () => ({
          brands: [
            { brand: "Chromium", version: "130" },
            { brand: "Google Chrome", version: "130" },
            { brand: "Not_A Brand", version: "24" },
          ],
          mobile: false,
          platform: "macOS",
        }),
      });
    } catch {
      /* ignore */
    }
  });
  context.setDefaultTimeout(ACTION_TIMEOUT);
  const page = await context.newPage();

  try {
    // 1. Home.
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: ACTION_TIMEOUT });
    await sleep(800);

    // 2. Explore marketing pages.
    await explore(page);

    // 3. Reach sign-up (via plan CTA or goto).
    await reachSignUp(page);

    // 4. Sign up.
    const usedIndex = await signUp(page, index, takeNextIndex);
    result.index = usedIndex;
    result.signedUp = new URL(page.url()).pathname === "/";
    if (result.signedUp) stats.signedUp++;

    // 5. Survey.
    result.surveyOutcome = await runSurvey(page);
    result.surveyStarted = result.surveyOutcome !== "skipped";
    if (result.surveyOutcome === "completed") stats.surveysCompleted++;
    if (result.surveyOutcome === "dropped") stats.droppedAtStep4++;

    // 6. Maybe post.
    result.posted = await maybePost(page);
    if (result.posted) stats.posts++;

    // 7. Maybe vote on a few board posts (creates ranking + post_voted events).
    stats.votes += await maybeVote(page);

    // Let posthog-js flush queued events before tearing down.
    await page.waitForTimeout(1500);

    console.log(
      `[${position}/${total}] user test${result.index}: ` +
        `${result.signedUp ? "signed up" : "SIGNUP FAILED"}; ` +
        `survey=${result.surveyOutcome}` +
        (result.posted ? "; posted" : "")
    );
  } catch (err) {
    console.error(`[${position}/${total}] user test${result.index} errored: ${(err as Error).message}`);
  } finally {
    await context.close().catch(() => {});
  }

  return result;
}

// ── Concurrency pool ───────────────────────────────────────────────────────────

async function runPool(
  browser: Browser,
  indices: number[],
  concurrency: number,
  takeNextIndex: () => number
): Promise<void> {
  const total = indices.length;
  let cursor = 0;

  async function worker() {
    while (cursor < indices.length) {
      const myPos = cursor++;
      const idx = indices[myPos];
      await runJourney(browser, idx, total, myPos + 1, takeNextIndex);
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, total)) }, () => worker());
  await Promise.all(workers);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const start = await resolveStartIndex();

  // Indices for the planned journeys. A shared "next free index" counter lets
  // signup-collision retries claim indices beyond the planned range.
  let nextFree = start + USER_COUNT;
  const takeNextIndex = () => nextFree++;

  const indices = Array.from({ length: USER_COUNT }, (_, i) => start + i);

  console.log(
    `[seed] BASE_URL=${BASE_URL} USER_COUNT=${USER_COUNT} START_INDEX=${start} ` +
      `CONCURRENCY=${CONCURRENCY} HEADLESS=${HEADLESS}`
  );
  console.log(
    `[seed] rates: survey_start=${SURVEY_START_RATE} survey_complete=${SURVEY_COMPLETE_RATE} post=${POST_RATE}`
  );

  const browser = await chromium.launch({ headless: HEADLESS });
  try {
    await runPool(browser, indices, CONCURRENCY, takeNextIndex);
  } finally {
    await browser.close().catch(() => {});
  }

  console.log("\n[seed] ── summary ─────────────────────────");
  console.log(`  signed up:          ${stats.signedUp}`);
  console.log(`  surveys started:    ${stats.surveysStarted}`);
  console.log(`  surveys completed:  ${stats.surveysCompleted}`);
  console.log(`  dropped at long-form: ${stats.droppedAtStep4}`);
  console.log(`  posts created:      ${stats.posts}`);
  console.log(`  votes cast:         ${stats.votes}`);
  console.log("[seed] ─────────────────────────────────────");
}

main().catch((err) => {
  console.error("[seed] fatal:", err);
  process.exit(1);
});
