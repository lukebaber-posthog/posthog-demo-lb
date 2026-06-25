import { SiteShell } from "@/components/site-shell";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export default function PricingPage() {
  return (
    <SiteShell>
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
          Vauge pricing...
        </h1>
        <p className="mt-3.5 text-base leading-snug tracking-tight text-[#61646B] md:text-lg dark:text-[#94979E]">
          Start free and then give us all your money.
        </p>
      </div>

      <PricingPlans />
    </SiteShell>
  );
}
