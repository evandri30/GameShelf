import { Gamepad2, Play, CheckCircle2, XCircle, Clock, Trophy, Star } from "lucide-react"
import type { ShelfStatus, Shelf } from '@/generated/prisma/browser'
import Image from "next/image"
import Link from "next/link"
import { getCroppedImageUrl } from "@/utils/image"
import { Card, SectionHeading } from "@/components/ui/Card"
import DashboardCharts from "./DashboardCharts"

interface DashboardStatsProps {
    stats: Record<ShelfStatus, { count: number; playtime: number; rating: number }>
    totalGames: number
    topGames: Shelf[]
}

export default function DashboardStats({ stats, totalGames, topGames }: DashboardStatsProps) {
    const statCards = [
        { title: "Total Games", value: totalGames, icon: Gamepad2, color: "text-accent" },
        { title: "Playing", value: stats.PLAYING?.count || 0, icon: Play, color: "text-status-playing" },
        { title: "Completed", value: stats.COMPLETED?.count || 0, icon: CheckCircle2, color: "text-status-completed" },
        { title: "Planned", value: stats.PLANNED?.count || 0, icon: Clock, color: "text-status-planned" },
        { title: "Dropped", value: stats.DROPPED?.count || 0, icon: XCircle, color: "text-status-dropped" },
    ]

    return (
        <div className="mx-auto w-full max-w-5xl space-y-16">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title} className="flex flex-col items-center justify-center gap-3 p-6 transition-colors hover:border-line-strong">
                            <Icon className={`h-7 w-7 ${stat.color}`} />
                            <div className="text-center">
                                <p className="font-mono text-3xl font-bold tracking-tight text-fg">{stat.value}</p>
                                <p className="mt-1 text-sm font-medium tracking-wide text-muted">{stat.title}</p>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Visual Charts */}
            <DashboardCharts stats={stats} />

            {/* Top Games Section */}
            {topGames.length > 0 && (
                <div className="mt-8 flex flex-col gap-6">
                    <SectionHeading title="Top Games" icon={Trophy} />

                    <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-5">
                        {topGames.map((game, idx) => (
                            <Link
                                href={`/games/${game.slug}`}
                                key={game.id}
                                className="group relative block aspect-3/4 overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-accent/60 hover:shadow-glow"
                            >
                                {/* Ranking Badge */}
                                <div className="absolute left-2 top-2 z-20 rounded border border-line-strong bg-base/80 px-2 py-0.5 font-mono text-xs font-bold text-accent">
                                    #{idx + 1}
                                </div>

                                {game.backgroundImage ? (
                                    <Image
                                        src={getCroppedImageUrl(game.backgroundImage)}
                                        alt={game.title}
                                        fill
                                        sizes="(max-width: 1024px) 50vw, 200px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-sm text-subtle">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-linear-to-t from-base via-base/80 to-transparent p-4">
                                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-fg md:text-base">{game.title}</h3>
                                    {(game.rating ?? 0) > 0 && (
                                        <div className="mt-2 flex items-center gap-1 border-t border-line pt-2 font-mono text-xs text-muted">
                                            <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {game.rating}/5
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
