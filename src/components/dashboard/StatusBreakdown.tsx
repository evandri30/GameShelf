import { PieChart as PieIcon, HelpCircle } from "lucide-react"
import type { ShelfStatus } from '@/generated/prisma/browser'
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import { Card } from "@/components/ui/Card"

type StatusStats = Partial<Record<ShelfStatus, { count: number; playtime: number }>>

// Plain CSS donut (conic-gradient): server-rendered, no charting library shipped to the client
export default function StatusBreakdown({ stats }: { stats: StatusStats }) {
    const slices = SHELF_STATUSES
        .map((status) => ({ status, count: stats[status]?.count ?? 0, hours: stats[status]?.playtime ?? 0 }))
    const total = slices.reduce((acc, s) => acc + s.count, 0)
    const filled = slices.filter((s) => s.count > 0)

    // conic-gradient stops with a small gap between slices
    const gap = filled.length > 1 ? 1.5 : 0
    const stops = filled.map(({ status }, i) => {
        const start = (filled.slice(0, i).reduce((acc, s) => acc + s.count, 0) / total) * 360
        const end = start + (filled[i].count / total) * 360
        return `${STATUS_META[status].color} ${start + gap}deg ${end - gap}deg, transparent ${end - gap}deg ${end}deg`
    })

    return (
        <Card className="flex flex-col p-6">
            <div className="mb-6 flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-accent" aria-hidden />
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Status breakdown</h2>
            </div>

            {total === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-subtle">
                    <HelpCircle className="h-10 w-10 opacity-40" />
                    <span className="text-sm">Nothing on the shelf yet.</span>
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center gap-8">
                    <div
                        role="img"
                        aria-label={filled.map((s) => `${STATUS_META[s.status].label}: ${s.count}`).join(", ")}
                        className="relative grid h-44 w-44 shrink-0 place-items-center rounded-full"
                        style={{ background: `conic-gradient(${stops.join(", ")})` }}
                    >
                        <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-surface">
                            <span className="font-mono text-4xl font-bold text-fg">{total}</span>
                            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-subtle">Games</span>
                        </div>
                    </div>

                    <ul className="w-full divide-y divide-line text-sm">
                        {slices.map(({ status, count, hours }) => (
                            <li key={status} className="flex items-center gap-3 py-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_META[status].color }} />
                                <span className="flex-1 text-muted">{STATUS_META[status].label}</span>
                                <span className="font-mono text-xs text-subtle">{hours}h</span>
                                <span className="w-8 text-right font-mono font-semibold text-fg">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    )
}
