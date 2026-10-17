"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, SlidersHorizontal, X } from "lucide-react"
import { FILTER_KEYS, GAME_ORDERINGS, discoverHref, type DiscoverQuery } from "@/constants/discover"

type Option = { value: string; label: string }

type Props = {
    query: DiscoverQuery
    genres: Option[]
    platforms: Option[]
    years: Option[]
}

const selectClass =
    "h-9 min-w-0 cursor-pointer rounded-md border bg-surface px-2 text-sm transition-colors focus:border-accent focus:outline-none"

// Genre / platform / year / sort. Each change navigates; a new filter always starts from page 1.
export default function DiscoverFilters({ query, genres, platforms, years }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const set = (key: (typeof FILTER_KEYS)[number], value: string) => {
        startTransition(() => router.push(discoverHref({ ...query, [key]: value || undefined, page: 1 })))
    }

    const active = FILTER_KEYS.some((key) => query[key])

    const fields: { key: (typeof FILTER_KEYS)[number]; label: string; options: readonly Option[]; placeholder: string }[] = [
        { key: "genre", label: "Genre", options: genres, placeholder: "All genres" },
        { key: "platform", label: "Platform", options: platforms, placeholder: "All platforms" },
        { key: "year", label: "Release year", options: years, placeholder: "Any year" },
        { key: "ordering", label: "Sort by", options: GAME_ORDERINGS.slice(1), placeholder: GAME_ORDERINGS[0].label },
    ]

    return (
        <div className="flex flex-wrap items-center gap-2" aria-busy={isPending}>
            <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <SlidersHorizontal className="h-4 w-4" />}
                Filters
            </span>

            {fields.map(({ key, label, options, placeholder }) => (
                <label key={key} className="min-w-0">
                    <span className="sr-only">{label}</span>
                    <select
                        value={query[key] ?? ""}
                        onChange={(e) => set(key, e.target.value)}
                        className={`${selectClass} ${query[key] ? "border-accent text-accent" : "border-line text-fg"}`}
                    >
                        <option value="">{placeholder}</option>
                        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </label>
            ))}

            {active && (
                <button
                    type="button"
                    onClick={() => startTransition(() => router.push(discoverHref({ search: query.search })))}
                    className="flex h-9 cursor-pointer items-center gap-1 rounded-md px-2 text-sm text-muted transition-colors hover:text-fg"
                >
                    <X className="h-4 w-4" /> Clear
                </button>
            )}
        </div>
    )
}
