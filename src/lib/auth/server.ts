import { createNeonAuth } from "@neondatabase/auth/next/server";

// Neon Auth (managed Better Auth). Users/sessions/accounts live in the
// `neon_auth` schema and are managed by Neon — no local Drizzle auth schema.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
