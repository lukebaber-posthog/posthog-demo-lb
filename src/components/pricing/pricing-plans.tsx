"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EVENTS, track } from "@/lib/analytics/events";

type Plan = {
  slug: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  variant: "outline" | "default" | "secondary";
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    slug: "free",
    name: "Seedling",
    price: "$0",
    cadence: "/month",
    description: "Everything a new plant parent needs to keep their first leafy friends thriving.",
    features: [
      "Track up to 5 plants",
      "Watering & light reminders",
      "Plant identification (5 scans/month)",
      "Beginner care guides",
      "Community board access",
    ],
    cta: "Get started",
    variant: "outline",
  },
  {
    slug: "pro",
    name: "Gardener",
    price: "$49",
    cadence: "/month",
    description: "Grow your collection with smarter reminders and unlimited plant know-how.",
    features: [
      "Track up to 100 plants",
      "Smart, weather-aware reminders",
      "Unlimited plant identification",
      "Full care guide library",
      "Personalized care schedules",
      "Priority email support",
    ],
    cta: "Start free trial",
    variant: "default",
    featured: true,
  },
  {
    slug: "enterprise",
    name: "Greenhouse",
    price: "Custom",
    cadence: "",
    description: "Care tools tailored to nurseries, plant shops, and serious collectors.",
    features: [
      "Unlimited plants",
      "Team & shared collections",
      "Advanced care analytics",
      "Bulk plant import & labeling",
      "Dedicated plant care specialist",
      "Priority onboarding & support",
    ],
    cta: "Contact sales",
    variant: "secondary",
  },
];

export function PricingPlans() {
  const router = useRouter();

  const handleSelect = (slug: Plan["slug"]) => {
    track(EVENTS.PRICING_PLAN_SELECTED, { plan: slug });
    router.push("/sign-up");
  };

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.slug}
          className={`flex flex-col rounded-xl border p-5 ${
            plan.featured
              ? "border-[#00E599] dark:border-[#00E599]"
              : "border-[#E4E5E7] dark:border-[#303236]"
          }`}
        >
          {plan.featured && (
            <span className="mb-3 inline-flex w-fit items-center rounded-full bg-[#00E599]/15 px-2.5 py-0.5 text-xs font-medium text-green-600">
              Most popular
            </span>
          )}

          <h2 className="text-xl font-semibold leading-none tracking-tighter">
            {plan.name}
          </h2>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
              {plan.price}
            </span>
            {plan.cadence && (
              <span className="text-sm text-[#61646B] dark:text-[#94979E]">
                {plan.cadence}
              </span>
            )}
          </div>

          <p className="mt-3.5 text-sm leading-snug tracking-tight text-[#61646B] dark:text-[#94979E]">
            {plan.description}
          </p>

          <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-green-600">
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant={plan.variant}
            className="mt-6 w-full"
            data-testid="plan-cta"
            onClick={() => handleSelect(plan.slug)}
          >
            {plan.cta}
          </Button>
        </div>
      ))}
    </div>
  );
}
