import type { ReactNode } from "react"
import { CalendarCheck } from "lucide-react"
import { Card } from "@/components/ui/Card"

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type Props = {
    title: string
    buckets: { label: string; count: number }[]
    action?: ReactNode
}

// Vertical CSS bars of completed games per month (server-rendered, no chart library)
export default function CompletionChart({ title, buckets, action }: Props) {
    const max = Math.max(1, ...buckets.map((b) => b.count))
    const total = buckets.reduce((acc, b) => acc + b.count, 0)

    return (
        <Card className="p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-accent" aria-hidden />
                    <h2 className="font-display text-lg font-semibold uppercase tracking-wide">{title}</h2>
                    <span className="rounded bg-surface-2 px-1.5 font-mono text-xs text-muted">{total}</span>
                </div>
                {action}
            </div>

            {total === 0 ? (
                <p className="py-10 text-center text-sm text-subtle">No completed games in this period yet. Mark a game as Completed and it shows up here.</p>
            ) : (
                <ol className="flex h-48 items-end gap-1.5 sm:gap-2" aria-label={`${title}: ${buckets.map((b) => `${b.label} ${b.count}`).join(", ")}`}>
                    {buckets.map((b, i) => (
                        <li key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                            <span className={`font-mono text-[11px] ${b.count ? "text-fg" : "text-transparent"}`}>{b.count}</span>
                            <div
                                className={`w-full rounded-t ${b.count ? "bg-accent" : "bg-surface-2"}`}
                                style={{ height: `${b.count ? Math.max(6, (b.count / max) * 100) : 3}%` }}
                            />
                            <span className="text-[10px] uppercase text-subtle">{b.label}</span>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    )
}
