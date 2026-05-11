"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import type { GameProps } from "@/types"
import GOTYSelect from "./GOTYSelect"
import { getCroppedImageUrl } from "@/utils/image"

type GOTYSliderProps = {
    games: GameProps[]
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
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-zinc-400" />
                <h2 className="text-2xl font-bold text-white">Game of the Year Winners</h2>
            </div>

            <div className="relative w-full h-100 md:h-125 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
                <div className="absolute inset-0">
                    {currentGame.background_image ? (
                        <Image
                            src={getCroppedImageUrl(currentGame.background_image, 1200, 720)}
                            alt={currentGame.name}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800" />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-8 md:p-12">

                    <div className="md:flex items-center gap-3 mb-4 hidden">
                        {currentGame.metacritic && (
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm
                                ${currentGame.metacritic >= 75
                                    ? "border-green-500 bg-green-500/20 text-green-400"
                                    : currentGame.metacritic >= 50
                                        ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                                        : "border-red-500 bg-red-500/20 text-red-400"
                                }`}>
                                {currentGame.metacritic} Metacritic
                            </span>
                        )}

                        {currentGame.esrb_rating && (
                            <span className="text-sm px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 text-zinc-300">
                                {currentGame.esrb_rating.name}
                            </span>
                        )}
                    </div>

                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                        {currentGame.name}
                    </h3>

                    <div className="md:flex flex-wrap items-center gap-4 mb-4 text-zinc-300 hidden">
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
                                    className="text-sm px-2 py-1 rounded-md bg-zinc-800/80 backdrop-blur-sm border border-zinc-700"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Link
                        href={`/games/${currentGame.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition w-fit mb-4"
                    >
                        View Details
                    </Link>
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-zinc-700 text-white hover:bg-black/70 transition"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-zinc-700 text-white hover:bg-black/70 transition"
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
                                ? "w-8 bg-white"
                                : "w-2 bg-white/50 hover:bg-white/75"
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