"use client"

import Image from "next/image"
import type { GameProps } from "@/types"

type GOTYSliderProps = {
    games: GameProps[];
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
                    className={`relative shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition ${index === currentIndex
                        ? "border-white"
                        : "border-zinc-700 hover:border-zinc-500 opacity-60 hover:opacity-100"}`}
                >
                    {game.background_image ? (
                        <Image
                            src={game.background_image}
                            alt={game.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </button>
            ))}
        </section>
    )
}