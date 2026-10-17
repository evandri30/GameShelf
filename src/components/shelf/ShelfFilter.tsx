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
                        aria-pressed={activeFilter === filter.value}
                        className={`cursor-pointer rounded-md border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${activeFilter === filter.value
                            ? "border-accent bg-accent text-accent-fg"
                            : "border-line-strong text-muted hover:border-muted hover:text-fg"
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Games Count */}
            <div className="mt-6 font-mono text-sm text-subtle">
                Showing {filteredShelf.length} {filteredShelf.length === 1 ? 'game' : 'games'}
            </div>

            {/* Grind Game */}
            {filteredShelf.length === 0 ? <EmptyShelf /> : <ShelfGrind shelf={filteredShelf} />}
        </>
    )
}