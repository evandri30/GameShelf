import FeatureCard from "@/components/landing/FeatureCard";
import HowItsWork from "@/components/landing/HowItsWork";
import FAQ from "@/components/landing/FAQ";
import { FadeIn, ScrollFadeIn } from '@/components/AnimatedSection'
import { features } from "@/constants/feature";
import { howItsWork } from "@/constants/howitswork"
import CTA from "@/components/landing/CTA";
import Header from "@/components/landing/Header";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16 flex flex-col items-center text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
      <FadeIn>
        <section className="max-w-3xl flex flex-col items-center gap-4">
          <Header />
        </section>
      </FadeIn>

      {/* Features */}
      <FadeIn>
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>
      </FadeIn>

      {/* Bottom CTA */}
      <ScrollFadeIn>
        <section className="mt-24 text-center">
          <CTA />
        </section>
      </ScrollFadeIn>

      {/* How Its Works */}
      <ScrollFadeIn>
        <section className="mt-24 text-center">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <p className="mt-4 text-zinc-300 max-w-2xl mx-auto">
            GameShelf helps you manage your gaming collection with ease. Discover new games, track your progress, and share your shelves with friends.
          </p>
          {howItsWork.map((step) => (
            <HowItsWork key={step.no} {...step} />
          ))}
        </section>
      </ScrollFadeIn>

      {/* FAQ */}
      <ScrollFadeIn>
        <section className="mt-24 text-center">
          <FAQ />
        </section>
      </ScrollFadeIn>
    </main>
  );
}
