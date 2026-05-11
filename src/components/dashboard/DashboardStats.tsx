import { Gamepad2, Play, CheckCircle2, XCircle, Clock } from "lucide-react"
import { ShelfStatus, Shelf } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

interface DashboardStatsProps {
    stats: Record<ShelfStatus, number>
    totalGames: number
    topGames: Shelf[]
}

export default function DashboardStats({ stats, totalGames, topGames }: DashboardStatsProps) {
    const statCards = [
        { title: "Total Games", value: totalGames, icon: Gamepad2, color: "text-zinc-400" },
        { title: "Playing", value: stats.PLAYING || 0, icon: Play, color: "text-zinc-400" },
        { title: "Completed", value: stats.COMPLETED || 0, icon: CheckCircle2, color: "text-zinc-400" },
        { title: "Planned", value: stats.PLANNED || 0, icon: Clock, color: "text-zinc-400" },
        { title: "Dropped", value: stats.DROPPED || 0, icon: XCircle, color: "text-zinc-400" },
    ]

    return (
        <div className="w-full max-w-5xl mx-auto space-y-16">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition hover:-translate-y-1 hover:border-zinc-600">
                            <Icon className={`w-8 h-8 ${stat.color}`} />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                                <p className="text-sm text-zinc-400 font-medium tracking-wide mt-1">{stat.title}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Top Games Section */}
            {topGames.length > 0 && (
                <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Gamepad2 className="w-6 h-6 text-zinc-400" />
                        <h2 className="text-2xl font-bold text-white">Top Games</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                        {topGames.map((game, idx) => (
                            <Link href={`/games/${game.rawgId}`} key={game.id} className="group relative flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 aspect-[3/4] hover:-translate-y-1 hover:border-zinc-600 transition block">
                                
                                {/* Ranking Badge */}
                                <div className="absolute top-2 left-2 z-20 text-xs font-bold px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900/80 text-zinc-400">
                                    #{idx + 1}
                                </div>

                                {game.backgroundImage ? (
                                    <>
                                        <Image 
                                            src={game.backgroundImage} 
                                            alt={game.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-zinc-900/95 via-zinc-900/70 to-transparent flex flex-col justify-end p-4 z-10 transition-opacity">
                                            <h3 className="text-white font-semibold text-sm md:text-base leading-snug line-clamp-2">{game.title}</h3>
                                            {(game.rating ?? 0) > 0 && (
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-700/50 text-xs text-zinc-400 mt-2">
                                                    <span>⭐ {game.rating}/5</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-sm">
                                        No Image
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
