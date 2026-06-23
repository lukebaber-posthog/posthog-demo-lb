"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { ThemeSelector } from "@/components/themes/selector";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth/client";
import { LuSprout } from "react-icons/lu";


export function NavBar() {
  const { data: session, isPending } = useSession();

  // Identify on the anonymous→identified transition only. This also covers Google
  // OAuth, where the sign-in page redirects away before it can call identify().
  // The distinct_id guard keeps it a no-op once the user is already identified,
  // so it never re-fires on ordinary page loads.
  useEffect(() => {
    if (session?.user && posthog.get_distinct_id() !== session.user.id) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session]);

  const handleSignOut = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
  };

  return (
    <nav className="flex items-center justify-between py-6 md:py-8">
      <div className="flex items-center gap-5 md:gap-7">
        <Link href="/" aria-label="Home">
          <LuSprout className="size-8 text-green-600" />
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium sm:flex">
          <Link
            href="/about"
            data-testid="nav-about"
            className="text-[#61646B] transition-colors hover:text-foreground dark:text-[#94979E]"
          >
            About
          </Link>
          <Link
            href="/pricing"
            data-testid="nav-pricing"
            className="text-[#61646B] transition-colors hover:text-foreground dark:text-[#94979E]"
          >
            Pricing
          </Link>
          <Link
            href="/survey"
            data-testid="nav-survey"
            className="text-[#61646B] transition-colors hover:text-foreground dark:text-[#94979E]"
          >
            Survey
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSelector />
        {isPending ? (
          <Button variant="outline" disabled>
            Loading...
          </Button>
        ) : session?.user ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/notes" data-testid="nav-notes">
                Notes
              </Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="default" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
