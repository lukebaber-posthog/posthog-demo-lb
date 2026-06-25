import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    title: "Care without the guesswork",
    body: "Sprout turns plant care into clear, gentle steps. No green thumb required, no guessing when to water — just the reminders and care guides that keep every leaf happy.",
  },
  {
    title: "Built for plant parents",
    body: "Lightweight by design and made for real homes. Track each plant, get watering and light nudges right on time, and watch your collection thrive.",
  },
  {
    title: "Friendly and growing together",
    body: "You're never tending alone. Sprout's community board lets plant parents swap tips, identify mystery sprouts, and cheer each other's new growth.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
          About Sprout
        </h1>
        <p className="max-w-xl text-base leading-snug tracking-tight text-[#61646B] md:text-lg dark:text-[#94979E]">
          Sprout is a friendly, lightweight plant-care companion that helps plant
          parents keep their houseplants alive, happy, and thriving.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold leading-none tracking-tighter md:text-2xl">
          Our story
        </h2>
        <p className="max-w-xl text-base leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
          We started Sprout after watching too many beloved plants quietly fade.
          Care apps were either overwhelming and full of jargon, or so bare-bones
          they told you nothing about your fern. We wanted something in between — a
          companion that tells you exactly when to water, how much light to give,
          and what each plant needs, then gets out of your way the rest of the
          time. Today Sprout helps thousands of plant parents keep their leafy
          friends thriving, one gentle reminder at a time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VALUES.map((value) => (
          <div
            key={value.title}
            className="rounded-xl border border-[#E4E5E7] p-5 dark:border-[#303236]"
          >
            <div className="mb-2 h-1 w-8 rounded-full bg-green-600" />
            <h3 className="mb-1.5 text-base font-semibold leading-snug tracking-tight">
              {value.title}
            </h3>
            <p className="text-sm leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
              {value.body}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E5E7] p-5 dark:border-[#303236]">
        <h2 className="text-xl font-semibold leading-none tracking-tighter md:text-2xl">
          Ready to grow with Sprout?
        </h2>
        <p className="max-w-xl text-sm leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
          See which plan fits your plant family, or tell us what you think — we read
          every response.
        </p>
        <div className="mt-1 flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href="/pricing">View pricing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/survey">Take the survey</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
