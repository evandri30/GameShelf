import FeatureCard from "@/components/landing/FeatureCard";
import FAQ from "@/components/landing/FAQ";
import { features } from "@/constants/feature";
import CTA from "@/components/landing/CTA";
import Header from "@/components/landing/Header";
import { SectionHeading } from "@/components/ui/Card";

export default function Home() {
  // -mt-16: the hero backdrop runs under the translucent navbar
  return (
    <div className="-mt-16">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-28 px-6 pb-8">
        {/* Features */}
        <section id="features" className="scroll-mt-24 space-y-8">
          <SectionHeading title="What you get" description="Everything you need to keep your backlog under control." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <FAQ />
        </section>

        {/* Bottom CTA */}
        <section>
          <CTA />
        </section>
      </div>
    </div>
  );
}
