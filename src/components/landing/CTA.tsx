import Link from "next/link"
import { buttonClass } from "@/components/ui/Button"
import CoverCollage from "@/components/CoverCollage"

export default function CTA() {
    return (
        <section className="relative isolate overflow-hidden rounded-xl border border-line px-6 py-20 text-center">
            <CoverCollage className="absolute inset-0 -z-20 opacity-30" columns={5} />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-base)_25%,transparent_80%)]" />
            <div className="flex flex-col items-center gap-5">
                <h2 className="max-w-xl font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">
                    Your backlog won&apos;t sort itself
                </h2>
                <p className="max-w-md text-fg/80">Make an account in under a minute and add your first game.</p>
                <Link href="/auth" className={buttonClass("primary", "lg")}>Create your shelf</Link>
            </div>
        </section>
    )
}
