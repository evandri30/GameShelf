import Link from "next/link"
import { ListChecks, ListOrdered } from "lucide-react"
import { buttonClass } from "@/components/ui/Button"

export default function PageHeader({ total }: { total: number }) {
    return (
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
                    My Shelf
                </h1>
                <p className="text-muted">
                    {total > 0
                        ? <><span className="font-mono text-accent">{total}</span> {total === 1 ? "game" : "games"}. Track your journey, remember what you finished.</>
                        : "Track your journey. Manage what you play. Remember what you finished."}
                </p>
            </div>
            <div className="flex gap-2">
                <Link href="/shelf/backlog" className={buttonClass("secondary", "sm")}>
                    <ListOrdered className="h-4 w-4" /> Up next
                </Link>
                <Link href="/shelf/lists" className={buttonClass("secondary", "sm")}>
                    <ListChecks className="h-4 w-4" /> Lists
                </Link>
            </div>
        </section>
    )
}
