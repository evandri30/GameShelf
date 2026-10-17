import { CheckCircle2, Clock, Gamepad2, Star, Trophy } from "lucide-react"
import type { ShelfStatus } from '@/generated/prisma/browser'
import Image from "next/image"
import Link from "next/link"
import { getCroppedImageUrl } from "@/utils/image"
import { Card } from "@/components/ui/Card"
import StatusBreakdown from "./StatusBreakdown"

export type DashboardData = {
    stats: Partial<Record<ShelfStatus, { count: number; playtime: number }>>
    totalGames: number
    totalHours: number
    averageRating: number | null
    ratedGames: number
    topGames: { id: string; title: string; slug: string; backgroundImage: string | null; rating: number | null; playtime: number | null }[]
}

export default function DashboardStats({ data }: { data: DashboardData }) {
    const completed = data.stats.COMPLETED?.count ?? 0
    const completionRate = data.totalGames ? Math.round((completed / data.totalGames) * 100) : 0

    const kpis = [
        { label: "Games", value: data.totalGames.toLocaleString("en-US"), hint: "on the shelf", icon: Gamepad2 },
        { label: "Completed", value: completed.toLocaleString("en-US"), hint: `${completionRate}% completion`, icon: CheckCircle2 },
        { label: "Hours played", value: data.totalHours.toLocaleString("en-US"), hint: "logged so far", icon: Clock },
        {
            label: "Avg. rating",
            value: data.averageRating ? data.averageRating.toFixed(1) : "–",
            hint: data.ratedGames ? `from ${data.ratedGames} rated` : "nothing rated yet",
            icon: Star,
        },
    ]

    return (
        <div className="space-y-6">
            {/* KPI strip */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map(({ label, value, hint, icon: Icon }) => (
                    <Card key={label} className="p-5">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                            <Icon className="h-4 w-4 text-accent" aria-hidden />
                        </div>
                        <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-fg">{value}</p>
                        <p className="mt-1 text-xs text-subtle">{hint}</p>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                <StatusBreakdown stats={data.stats} />

                {/* Top games */}
                <Card className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-accent" aria-hidden />
                        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Top games</h2>
                    </div>

                    {data.topGames.length === 0 ? (
                        <p className="py-10 text-center text-sm text-subtle">
                            Rate games you&apos;re playing or have completed and your favorites show up here.
                        </p>
                    ) : (
                        <ol className="space-y-2">
                            {data.topGames.map((game, idx) => (
                                <li key={game.id}>
                                    <Link
                                        href={`/games/${game.slug}`}
                                        className="group flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-surface-2"
                                    >
                                        <span className={`w-6 text-center font-mono text-lg font-bold ${idx === 0 ? "text-accent" : "text-subtle"}`}>{idx + 1}</span>
                                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded border border-line">
                                            {game.backgroundImage ? (
                                                <Image src={getCroppedImageUrl(game.backgroundImage, 200)} alt="" fill sizes="96px" loading="eager" className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-surface-2" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-fg group-hover:text-accent">{game.title}</p>
                                            <p className="flex items-center gap-3 font-mono text-xs text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Star className={`h-3.5 w-3.5 ${game.rating ? "fill-accent text-accent" : ""}`} aria-hidden />
                                                    {game.rating ? `${game.rating}/5` : "Unrated"}
                                                </span>
                                                <span>{game.playtime ?? 0}h</span>
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            </div>
        </div>
    )
}
