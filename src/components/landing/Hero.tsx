import Link from "next/link"
import { buttonClass } from "@/components/ui/Button"
import LiveShelf from "./LiveShelf"

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden px-6 pt-16">
            <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <div className="flex animate-fade-up flex-col items-start gap-6">
                    <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl">
                        Every game you play.
                        <br />
                        One shelf.
                    </h1>
                    <p className="max-w-md text-lg text-fg/80">
                        Find a game, put it on your shelf, and always know what you&apos;re playing, what&apos;s next and what you&apos;ve finished.
                    </p>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Link href="/auth" className={buttonClass("primary", "lg")}>Create your shelf</Link>
                        <Link href="/auth" className={buttonClass("secondary", "lg")}>Log in</Link>
                    </div>
                    <p className="text-sm text-muted">Free, no ads. Works on your phone too.</p>
                </div>

                <div className="animate-fade-in [animation-delay:150ms]">
                    <LiveShelf />
                </div>
            </div>
        </section>
    )
}
