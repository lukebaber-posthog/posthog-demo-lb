import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});

// Expose the initialized instance on window so you can call posthog.capture(...)
// (and identify/reset/etc.) from the browser DevTools console. npm-module imports
// aren't global by default — only the old script-snippet install sets window.posthog.
if (typeof window !== "undefined") {
  (window as Window & { posthog?: typeof posthog }).posthog = posthog;
}
