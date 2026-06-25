import type { ReactNode } from "react";
import { NavBar } from "@/components/navbar";

// Shared page shell so the marketing pages and survey match the app layout
// (centered column + nav). Mirrors the structure used by the home page.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-2xl md:px-0 lg:max-w-4xl">
        <NavBar />
        <main className="flex flex-1 flex-col gap-8 py-4">{children}</main>
      </div>
    </div>
  );
}
