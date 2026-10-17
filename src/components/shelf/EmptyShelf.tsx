import Link from "next/link"
import { buttonClass } from "@/components/ui/Button"

export default function EmptyShelf() {
    return (
        <div className="mt-16 flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong bg-surface/50 px-10 py-12">
            <p className="text-muted">Nothing here yet. Start adding games.</p>
            <Link href="/games" className={buttonClass("secondary", "sm")}>
                Discover games
            </Link>
        </div>
    )
}
