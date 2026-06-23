import { auth } from "@/lib/auth/server";

// Proxies /api/auth/* to the Neon Auth service configured in server.ts
export const { GET, POST } = auth.handler();
