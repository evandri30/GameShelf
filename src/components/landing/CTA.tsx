import Link from "next/link"
import { buttonClass } from "@/components/ui/Button"

export default function CTA() {
    return (
        <div className="relative overflow-hidden rounded-lg border border-accent/30 bg-surface px-6 py-14 text-center">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(198,244,50,0.12),transparent_70%)]" />
            <div className="relative flex flex-col items-center gap-5">
                <h2 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
                    Ready to organize your collection?
                </h2>
                <p className="max-w-md text-muted">It takes 30 seconds. Your backlog will thank you.</p>
                <Link href="/auth" className={buttonClass("primary", "lg")}>
                    Create your shelf
                </Link>
            </div>
        </div>
    )
}
