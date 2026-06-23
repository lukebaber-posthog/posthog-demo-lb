// Selects which Neon branch to connect to, based on the deploy environment:
//   • production deployment (main branch on Vercel) → prod branch (_PROD)
//   • localhost + preview branches                  → dev branch  (_DEV)
//
// VERCEL_ENV is "production" only for production deploys (the main branch). It's
// "preview" for every other branch's deploy and undefined when running locally,
// so both of those fall through to the dev branch.
export const isProductionDb = process.env.VERCEL_ENV === "production";
export const dbBranch: "prod" | "dev" = isProductionDb ? "prod" : "dev";

export function getConnectionString(): string {
  const url = isProductionDb
    ? process.env.DB_DATABASE_URL
    : process.env.DB_DATABASE_URL_DEV;

  if (!url) {
    throw new Error(
      `Missing ${isProductionDb ? "DB_DATABASE_URL_PROD" : "DB_DATABASE_URL_DEV"} environment variable`,
    );
  }
  return url;
}
