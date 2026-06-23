import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider } from "../../instrumentation";

// Server-only structured logger backed by the OTLP exporter in instrumentation.ts.
// Logs = "what the system did" (DB calls, errors, durations). For "what the user did"
// (clicks, signups) use posthog.capture() on the client instead.
//
// Only import this from server code ("use server" files, route handlers, server
// components) — the OpenTelemetry logs SDK does not run in the browser.
export const logger = logs.getLogger("posthog-demo-lb");

export { SeverityNumber };

// Server Actions / Route Handlers can freeze before the batch processor sends logs,
// so call this inside an `after()` callback to guarantee delivery.
export const flushLogs = () => loggerProvider.forceFlush();
