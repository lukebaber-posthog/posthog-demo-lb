"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/client";
import { GARDENS, joinGarden } from "@/lib/analytics/garden";
import { optIntoPlantPeople } from "@/lib/analytics/plant-people";

export function JoinOptions() {
  const { data: session, isPending } = useSession();
  const [joinedGarden, setJoinedGarden] = useState<string | null>(null);
  const [optedIn, setOptedIn] = useState(false);

  const handleJoinGarden = (key: string) => {
    joinGarden(key);
    setJoinedGarden(key);
  };

  const handleOptIn = () => {
    optIntoPlantPeople();
    setOptedIn(true);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
          Join the community 🌱
        </h1>
        <p className="mt-3.5 text-base leading-snug tracking-tight text-[#61646B] md:text-lg dark:text-[#94979E]">
          Two different things, on purpose. A <strong>garden</strong> is a shared
          space your activity rolls up to — a PostHog <em>group</em>. Opting into{" "}
          <strong>Plant People</strong> just tags you as an individual — a PostHog{" "}
          <em>cohort</em>.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      ) : !session?.user ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#E4E5E7] p-5 dark:border-[#303236]">
          <h2 className="text-xl font-semibold leading-none tracking-tighter">
            Sign in to join
          </h2>
          <p className="text-sm leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
            You need to be signed in so we can associate you with a garden or
            cohort.
          </p>
          <div className="mt-1">
            <Button asChild>
              <Link href="/sign-in" data-testid="join-sign-in">
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* GROUP — join a garden (a shared entity events roll up to) */}
          <section className="flex flex-col gap-4">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold leading-none tracking-tighter md:text-2xl">
                Join a Garden{" "}
                <span className="font-normal text-[#61646B] dark:text-[#94979E]">
                  · group
                </span>
              </h2>
              <p className="mt-2 text-sm leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
                A garden is a shared space several plant parents belong to. Your
                events roll up to it, so PostHog can compare gardens as units —
                active gardens, per-garden funnels, and breakdowns by a garden&apos;s
                plan or region.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {GARDENS.map((garden) => {
                const isJoined = joinedGarden === garden.key;
                return (
                  <div
                    key={garden.key}
                    className={`flex flex-col rounded-xl border p-5 ${
                      isJoined
                        ? "border-[#00E599] dark:border-[#00E599]"
                        : "border-[#E4E5E7] dark:border-[#303236]"
                    }`}
                  >
                    <h3 className="text-lg font-semibold leading-none tracking-tighter">
                      {garden.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-[#61646B] dark:text-[#94979E]">
                      <span className="capitalize">{garden.plan}</span> plan ·{" "}
                      {garden.region.toUpperCase()}
                    </p>
                    <Button
                      type="button"
                      variant={isJoined ? "outline" : "default"}
                      className="mt-5 w-full"
                      data-testid="garden-option"
                      data-garden={garden.key}
                      disabled={isJoined}
                      onClick={() => handleJoinGarden(garden.key)}
                    >
                      {isJoined ? "Joined ✓" : "Join garden"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* COHORT — opt in (a segment of individuals, no shared entity) */}
          <section className="flex flex-col gap-4">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold leading-none tracking-tighter md:text-2xl">
                Opt into Plant People{" "}
                <span className="font-normal text-[#61646B] dark:text-[#94979E]">
                  · cohort
                </span>
              </h2>
              <p className="mt-2 text-sm leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
                This only tags your profile. PostHog builds a cohort of everyone
                who opted in — a segment of individuals, with no shared entity and
                nothing to aggregate by.
              </p>
            </div>
            <div className="rounded-xl border border-[#E4E5E7] p-5 dark:border-[#303236]">
              <Button
                type="button"
                className="w-full sm:w-auto"
                data-testid="cohort-optin"
                disabled={optedIn}
                onClick={handleOptIn}
              >
                {optedIn ? "Opted in ✓" : "Opt into Plant People"}
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
