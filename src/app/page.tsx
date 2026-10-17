import FeatureCard from "@/components/landing/FeatureCard";
import HowItsWork from "@/components/landing/HowItsWork";
import FAQ from "@/components/landing/FAQ";
import { features } from "@/constants/feature";
import { howItsWork } from "@/constants/howitswork"
import CTA from "@/components/landing/CTA";
import Header from "@/components/landing/Header";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-6 py-16 text-center">
      <section className="flex max-w-3xl animate-fade-up flex-col items-center gap-4">
        <Header />
      </section>

      {/* Features */}
      <section className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="mt-24 text-center">
        <CTA />
      </section>

      {/* How Its Works */}
      <section className="mt-24 text-center">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">How It Works</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          GameShelf helps you manage your gaming collection with ease. Discover new games, track your progress, and share your shelves with friends.
        </p>
        {howItsWork.map((step) => (
          <HowItsWork key={step.no} {...step} />
        ))}
      </section>

      {/* FAQ */}
      <section className="mt-24 text-center">
        <FAQ />
      </section>
    </div>
  );
}
