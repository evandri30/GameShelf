import { PieChart as PieIcon, BarChart3, Clock, HelpCircle } from "lucide-react"
import type { ShelfStatus } from '@/generated/prisma/browser'
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import { Card } from "@/components/ui/Card"
import type { LucideIcon } from "lucide-react"

interface DashboardChartsProps {
    stats: Record<ShelfStatus, { count: number; playtime: number; rating: number }>
}

function ChartHeader({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <div className="rounded-md bg-surface-2 p-2 text-accent">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-display text-lg font-semibold text-fg">{title}</h3>
                <p className="text-xs text-muted">{description}</p>
            </div>
        </div>
    )
}

// Plain CSS charts (conic-gradient donut + div bars): server-rendered, no charting library shipped to the client
export default function DashboardCharts({ stats }: DashboardChartsProps) {
    const slices = SHELF_STATUSES
        .map((status) => ({ status, count: stats[status]?.count ?? 0 }))
        .filter((s) => s.count > 0)
    const total = slices.reduce((acc, s) => acc + s.count, 0)

    // Build the conic-gradient stops, leaving a small gap between slices
    const gap = slices.length > 1 ? 1.5 : 0
    const stops = slices.map(({ status }, i) => {
        const start = (slices.slice(0, i).reduce((acc, s) => acc + s.count, 0) / total) * 360
        const end = start + (slices[i].count / total) * 360
        return `${STATUS_META[status].color} ${start + gap}deg ${end - gap}deg, transparent ${end - gap}deg ${end}deg`
    })

    // PLANNED games have no playtime yet, so they are left out of the bars
    const bars = SHELF_STATUSES
        .filter((status) => status !== "PLANNED")
        .map((status) => ({ status, playtime: stats[status]?.playtime ?? 0 }))
    const maxPlaytime = Math.max(...bars.map((b) => b.playtime))

    return (
        <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {/* Donut: Status Breakdown */}
            <Card className="p-6">
                <ChartHeader icon={PieIcon} title="Status Breakdown" description="Distribution of your gaming shelf" />

                {total === 0 ? (
                    <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-subtle">
                        <HelpCircle className="h-10 w-10 opacity-40" />
                        <span className="text-sm">No games status statistics found.</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
                        <div
                            role="img"
                            aria-label={slices.map((s) => `${STATUS_META[s.status].label}: ${s.count}`).join(", ")}
                            className="relative grid h-48 w-48 shrink-0 place-items-center rounded-full"
                            style={{ background: `conic-gradient(${stops.join(", ")})` }}
                        >
                            <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-surface">
                                <span className="font-mono text-3xl font-bold text-fg">{total}</span>
                                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-subtle">Games</span>
                            </div>
                        </div>

                        <ul className="space-y-2 text-sm">
                            {slices.map(({ status, count }) => (
                                <li key={status} className="flex items-center gap-3">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_META[status].color }} />
                                    <span className="w-24 text-muted">{STATUS_META[status].label}</span>
                                    <span className="font-mono font-semibold text-fg">{count}</span>
                                    <span className="font-mono text-xs text-subtle">{Math.round((count / total) * 100)}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>

            {/* Bars: Playtime by status */}
            <Card className="p-6">
                <ChartHeader icon={BarChart3} title="Playtime Overview" description="Total gaming hours spent by status" />

                {maxPlaytime === 0 ? (
                    <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-subtle">
                        <Clock className="h-10 w-10 opacity-40" />
                        <span className="text-sm">No playtime data recorded yet.</span>
                    </div>
                ) : (
                    <ul className="space-y-5 py-2">
                        {bars.map(({ status, playtime }) => (
                            <li key={status} className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">{STATUS_META[status].label}</span>
                                    <span className="font-mono font-semibold text-fg">{playtime} hrs</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${(playtime / maxPlaytime) * 100}%`, background: STATUS_META[status].color }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    )
}
