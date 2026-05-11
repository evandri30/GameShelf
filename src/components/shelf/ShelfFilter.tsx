"use client"

import { useState } from "react"
import type { ShelfProps } from "@/types"
import EmptyShelf from "./EmptyShelf"
import ShelfGrind from './ShelfGrind';
import { filters } from "@/constants/filtersshelf"

type Props = {
    shelf: ShelfProps[]
}

export default function ShelfFilter({ shelf }: Props) {
    const [activeFilter, setActiveFilter] = useState("ALL")


    const filteredShelf = activeFilter === "ALL" ? shelf : shelf.filter(game => game.status === activeFilter)
    return (
        <>
            {/* Filter */}
            <div className="mt-12 flex flex-wrap gap-3 justify-center">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`px-5 py-2 rounded-full border transition-all ${activeFilter === filter.value
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white"
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Games Count */}
            <div className="mt-6 text-zinc-600 text-sm">
                Showing {filteredShelf.length} {filteredShelf.length > 1 ? 'games' : 'game'}
            </div>

            {/* Grind Game */}
            {filteredShelf.length === 0 ? <EmptyShelf /> : <ShelfGrind shelf={filteredShelf} />}
        </>
    )
}