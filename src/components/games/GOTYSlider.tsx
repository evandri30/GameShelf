"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import type { GotyGame } from "@/constants/gotywinner"
import { Badge, MetacriticBadge } from "@/components/ui/Badge"
import { SectionHeading } from "@/components/ui/Card"
import { buttonClass } from "@/components/ui/Button"
import GOTYSelect from "./GOTYSelect"
import { getCroppedImageUrl } from "@/utils/image"

type GOTYSliderProps = {
    games: GotyGame[]
}

export default function GOTYSlider({ games }: GOTYSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % games.length)
    }, [games.length])

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + games.length) % games.length)
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    useEffect(() => {
        if (!isHovered && games.length > 0) {
            const interval = setInterval(nextSlide, 5000)
            return () => clearInterval(interval)
        }
    }, [isHovered, nextSlide, games.length])

    if (!games.length) return null

    const currentGame = games[currentIndex]

    return (
        <section
            className="mt-12 w-full max-w-7xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="mb-6">
                <SectionHeading title="Game of the Year Winners" icon={Trophy} />
            </div>

            <div className="relative h-100 w-full overflow-hidden rounded-lg border border-line bg-surface md:h-125">
                <div className="absolute inset-0">
                    {currentGame.background_image ? (
                        <Image
                            src={getCroppedImageUrl(currentGame.background_image, 1200, 720)}
                            alt={currentGame.name}
                            fill
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="object-cover"
                            // only the visible slide is rendered, and it is the LCP element of /games
                            loading="eager"
                            fetchPriority={currentIndex === 0 ? "high" : "auto"}
                        />
                    ) : (
                        <div className="w-full h-full bg-surface-2" />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-base via-base/60 to-transparent" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-8 md:p-12">

                    <div className="mb-4 flex items-center gap-2">
                        <Badge className="border-accent/50 bg-accent/15 font-display font-bold uppercase tracking-wider text-accent">
                            <Trophy className="h-3.5 w-3.5" /> GOTY {currentGame.awardYear}
                        </Badge>
                        {currentGame.metacritic && <MetacriticBadge score={currentGame.metacritic} label className="hidden md:inline-flex" />}
                        {currentGame.esrb_rating && <Badge className="hidden border-line-strong bg-base/70 text-muted md:inline-flex">{currentGame.esrb_rating.name}</Badge>}
                    </div>

                    <h3 className="mb-3 font-display text-4xl font-bold text-fg drop-shadow-lg md:text-5xl">
                        {currentGame.name}
                    </h3>

                    <div className="mb-4 hidden flex-wrap items-center gap-4 text-sm text-muted md:flex">
                        <span className="flex items-center gap-1">
                            ⭐ {currentGame.rating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{currentGame.released?.slice(0, 4) ?? "N/A"}</span>
                        <span>•</span>
                        <div className="flex flex-wrap gap-2">
                            {currentGame.genres.slice(0, 3).map((genre) => (
                                <span
                                    key={genre.id}
                                    className="rounded border border-line-strong bg-base/60 px-2 py-0.5 text-xs text-fg backdrop-blur-sm"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Link
                        href={`/games/${currentGame.slug}`}
                        className={buttonClass("primary", "lg", "mb-4 w-fit")}
                    >
                        View Details
                    </Link>
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-line-strong bg-base/60 p-2 text-fg backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-line-strong bg-base/60 p-2 text-fg backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {games.map((game, index) => (
                        <button
                            key={game.id}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                ? "w-8 bg-accent"
                                : "w-2 bg-fg/40 hover:bg-fg/70"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <GOTYSelect games={games} currentIndex={currentIndex} onSelectGame={goToSlide} />
        </section>
    )
}