"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Trophy } from "lucide-react"
import type { GotyGame } from "@/constants/gotywinner"
import { Badge, MetacriticBadge } from "@/components/ui/Badge"
import { SectionHeading } from "@/components/ui/Card"
import { buttonClass } from "@/components/ui/Button"
import { getCroppedImageUrl } from "@/utils/image"

type GOTYSliderProps = {
    games: GotyGame[]
}

const INTERVAL_MS = 6000

// One featured banner + a rail of thumbnails as the only navigation
export default function GOTYSlider({ games }: GOTYSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        if (paused || games.length < 2) return
        const timer = setTimeout(() => setCurrentIndex((i) => (i + 1) % games.length), INTERVAL_MS)
        return () => clearTimeout(timer)
    }, [paused, currentIndex, games.length])

    if (!games.length) return null

    const game = games[currentIndex]

    return (
        <section
            className="w-full space-y-4"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Game of the Year winners"
        >
            <SectionHeading title="Game of the Year winners" icon={Trophy} />

            <div className="relative h-[26rem] w-full overflow-hidden rounded-lg border border-line bg-surface md:h-[30rem]">
                {game.background_image ? (
                    <Image
                        key={game.id}
                        src={getCroppedImageUrl(game.background_image, 1280)}
                        alt=""
                        fill
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        className="animate-fade-in object-cover"
                        // only the visible slide is rendered, and it is the LCP element of /games
                        loading="eager"
                        fetchPriority={currentIndex === 0 ? "high" : "auto"}
                    />
                ) : (
                    <div className="h-full w-full bg-surface-2" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-base via-base/50 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-base/80 via-transparent to-transparent" />

                <div key={`info-${game.id}`} className="absolute inset-x-0 bottom-0 max-w-2xl animate-fade-up p-6 md:p-10" aria-live="polite">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge className="border-accent/50 bg-accent/15 font-display font-bold uppercase tracking-wider text-accent">
                            <Trophy className="h-3.5 w-3.5" /> GOTY {game.awardYear}
                        </Badge>
                        {game.metacritic && <MetacriticBadge score={game.metacritic} label />}
                    </div>

                    <h3 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-fg drop-shadow-lg md:text-6xl">
                        {game.name}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                        <span className="flex items-center gap-1 font-mono text-fg">
                            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden /> {game.rating.toFixed(1)}
                        </span>
                        <span className="font-mono">{game.released?.slice(0, 4) ?? "N/A"}</span>
                        <span>{game.genres.map((g) => g.name).join(" · ")}</span>
                    </div>

                    <Link href={`/games/${game.slug}`} className={buttonClass("primary", "lg", "mt-6")}>
                        View details
                    </Link>
                </div>

                {/* progress bar for the auto-advance */}
                {!paused && (
                    <div key={`progress-${currentIndex}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-progress bg-accent" aria-hidden />
                )}
            </div>

            {/* Thumbnail rail */}
            <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]" role="tablist" aria-label="Choose a winner">
                {games.map((g, index) => (
                    <button
                        key={g.id}
                        type="button"
                        role="tab"
                        aria-selected={index === currentIndex}
                        aria-label={`${g.name}, GOTY ${g.awardYear}`}
                        onClick={() => setCurrentIndex(index)}
                        className={`group relative h-20 w-36 shrink-0 cursor-pointer snap-start overflow-hidden rounded-md border-2 transition ${index === currentIndex
                            ? "border-accent"
                            : "border-transparent opacity-50 hover:opacity-100"}`}
                    >
                        {g.background_image && (
                            <Image src={getCroppedImageUrl(g.background_image, 420)} alt="" fill sizes="144px" loading="eager" className="object-cover" />
                        )}
                        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-base/90 to-transparent px-2 pb-1 pt-4 text-left font-mono text-[11px] font-bold text-fg">
                            {g.awardYear}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    )
}
