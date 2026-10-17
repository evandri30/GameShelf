"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { ShelfStatus } from "@/generated/prisma/browser"
import type { ShelfProps } from "@/types"
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import EmptyShelf from "./EmptyShelf"
import ShelfGrind from './ShelfGrind';

type Props = {
    shelf: ShelfProps[]
}

type Filter = "ALL" | ShelfStatus
type Sort = "recent" | "rating" | "title"

const SORTS: { value: Sort; label: string }[] = [
    { value: "recent", label: "Recently added" },
    { value: "rating", label: "Highest rated" },
    { value: "title", label: "Title A–Z" },
]

export default function ShelfFilter({ shelf }: Props) {
    const [activeFilter, setActiveFilter] = useState<Filter>("ALL")
    const [sort, setSort] = useState<Sort>("recent")
    const [query, setQuery] = useState("")

    const counts = useMemo(() => {
        const byStatus = Object.fromEntries(SHELF_STATUSES.map((s) => [s, 0])) as Record<ShelfStatus, number>
        for (const game of shelf) byStatus[game.status]++
        return byStatus
    }, [shelf])

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        const filtered = shelf.filter((game) =>
            (activeFilter === "ALL" || game.status === activeFilter) && (!q || game.title.toLowerCase().includes(q))
        )

        // the server already returns newest first, so "recent" keeps that order
        if (sort === "rating") return [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        if (sort === "title") return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
        return filtered
    }, [shelf, activeFilter, sort, query])

    if (shelf.length === 0) return <EmptyShelf />

    const tabs: { value: Filter; label: string; count: number }[] = [
        { value: "ALL", label: "All", count: shelf.length },
        ...SHELF_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label, count: counts[s] })),
    ]

    return (
        <div className="space-y-6">
            {/* Status tabs */}
            <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line [scrollbar-width:none]">
                {tabs.map((tab) => {
                    const active = activeFilter === tab.value
                    return (
                        <button
                            key={tab.value}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setActiveFilter(tab.value)}
                            className={`relative flex shrink-0 cursor-pointer items-center gap-2 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
                        >
                            {tab.value !== "ALL" && <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[tab.value].color }} />}
                            {tab.label}
                            <span className={`rounded px-1.5 font-mono text-xs ${active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"}`}>{tab.count}</span>
                            {active && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-accent" aria-hidden />}
                        </button>
                    )
                })}
            </div>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search your shelf..."
                        aria-label="Search your shelf"
                        className="h-10 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted">
                    Sort
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as Sort)}
                        className="h-10 cursor-pointer rounded-md border border-line bg-surface px-3 text-sm text-fg focus:border-accent focus:outline-none"
                    >
                        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </label>
            </div>

            {visible.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line-strong py-16 text-center text-muted">
                    {query ? `No games matching "${query}".` : `No ${STATUS_META[activeFilter as ShelfStatus]?.label.toLowerCase() ?? ""} games yet.`}
                </p>
            ) : (
                <ShelfGrind shelf={visible} />
            )}
        </div>
    )
}
