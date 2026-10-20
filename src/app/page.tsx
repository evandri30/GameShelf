import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import MoreFeatures from "@/components/landing/MoreFeatures";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";

export default function Home() {
  // -mt-16: the hero runs under the translucent navbar
  return (
    <div className="-mt-16">
      <Hero />

      <div className="mx-auto flex max-w-6xl flex-col gap-28 px-6 pb-8 pt-12">
        <HowItWorks />
        <MoreFeatures />
        <FAQ />
        <CTA />
      </div>
    </div>
  );
}
