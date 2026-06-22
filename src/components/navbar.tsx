"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { ThemeSelector } from "@/components/themes/selector";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth/client";
import { GoHome } from "react-icons/go";


export function NavBar() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
  };

  return (
    <nav className="flex items-center justify-between py-6 md:py-8">
      <Link href="/">
        <GoHome className="size-10 text-green-600" />
      </Link>
      <div className="flex items-center gap-4">
        <ThemeSelector />
        {isPending ? (
          <Button variant="outline" disabled>
            Loading...
          </Button>
        ) : session?.user ? (
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <Button variant="default" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
