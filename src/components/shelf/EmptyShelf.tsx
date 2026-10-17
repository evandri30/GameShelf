import Link from "next/link"
import { Library } from "lucide-react"
import { buttonClass } from "@/components/ui/Button"

export default function EmptyShelf() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong bg-surface/50 px-10 py-20 text-center">
            <Library className="h-12 w-12 text-accent" aria-hidden />
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Your shelf is empty</h2>
            <p className="max-w-sm text-muted">Find something you&apos;re playing (or want to play) and add it to start tracking.</p>
            <Link href="/games" className={buttonClass("primary", "md", "mt-2")}>
                Discover games
            </Link>
        </div>
    )
}
