import { MoveRight } from "lucide-react"
import Link from "next/link"
import { buttonClass } from "@/components/ui/Button"
import CoverCollage from "@/components/CoverCollage"

export default function Header() {
    return (
        <section className="relative isolate flex min-h-dvh items-center overflow-hidden px-6 pt-16">
            {/* backdrop: tilted wall of cover art fading into the page */}
            <CoverCollage className="absolute inset-0 -z-20 opacity-40" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-base)_20%,transparent_75%)]" />
            <div className="absolute inset-0 -z-10 bg-linear-to-b from-base/60 via-base/40 to-base" />

            <div className="mx-auto flex max-w-3xl animate-fade-up flex-col items-center gap-6 text-center">
                <span className="rounded border border-accent/40 bg-accent/10 px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Built for gamers
                </span>

                <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl">
                    Every game you play.
                    <br />
                    <span className="text-accent">One shelf.</span>
                </h1>

                <p className="max-w-xl text-lg text-fg/80">
                    Discover new games, track what you&apos;re playing, rate what you finished and share your stats with friends.
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <Link href="/auth" className={buttonClass("primary", "lg", "group")}>
                        Create your shelf
                        <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                    <Link href="#features" className={buttonClass("secondary", "lg")}>
                        See how it works
                    </Link>
                </div>

                <p className="text-sm text-muted">Free. No ads. No clutter. Just your games.</p>
            </div>
        </section>
    )
}
