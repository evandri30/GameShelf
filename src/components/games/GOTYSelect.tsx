"use client"

import Image from "next/image"
import type { GotyGame } from "@/constants/gotywinner"
import { getCroppedImageUrl } from "@/utils/image"

type GOTYSliderProps = {
    games: GotyGame[];
    currentIndex: number;
    onSelectGame: (index: number) => void
}

export default function GOTYSelect({ games, currentIndex, onSelectGame }: GOTYSliderProps) {
    if (!games.length) return null


    return (
        <section className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {games.map((game, index) => (
                <button
                    key={game.id}
                    onClick={() => onSelectGame(index)}
                    aria-label={`Show ${game.name}`}
                    aria-current={index === currentIndex}
                    className={`relative h-20 w-32 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition ${index === currentIndex
                        ? "border-accent"
                        : "border-line opacity-60 hover:border-line-strong hover:opacity-100"}`}
                >
                    {game.background_image ? (
                        <Image
                            src={getCroppedImageUrl(game.background_image, 420)}
                            alt=""
                            fill
                            sizes="128px"
                            className="object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full bg-surface-2" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </button>
            ))}
        </section>
    )
}