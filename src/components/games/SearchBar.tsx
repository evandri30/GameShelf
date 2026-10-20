"use client";

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { discoverHref, type DiscoverQuery } from '@/constants/discover'
import { useSlashShortcut } from '@/hooks/useSlashShortcut'

type SearchBarProps = {
    searchQuery: string;
    totalGames: number;
    // current filters, kept when the search text changes
    query: DiscoverQuery;
}

export default function SearchBar({ searchQuery, totalGames, query }: SearchBarProps) {
    const router = useRouter()

    const [inputValue, setInputValue] = useState(searchQuery || '')
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const lastPushedQuery = useRef(searchQuery || '')
    const inputRef = useRef<HTMLInputElement>(null)
    useSlashShortcut(inputRef)

    // Sync state only if the URL changed from outside (e.g., Back/Forward navigation)
    useEffect(() => {
        if (lastPushedQuery.current !== (searchQuery || '')) {
            setInputValue(searchQuery || '')
            lastPushedQuery.current = searchQuery || ''
        }
    }, [searchQuery])

    const updateSearch = (value: string) => {
        lastPushedQuery.current = value
        // A new search keeps the filters but always starts from page 1
        router.push(discoverHref({ ...query, search: value || undefined, page: 1 }))
    }

    const handleSearchChange = (value: string) => {
        setInputValue(value)

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(() => {
            updateSearch(value)
        }, 500)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }
        updateSearch(inputValue)
    }

    const handleClear = () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }
        setInputValue('')
        updateSearch('')
    }

    return (
        <section className="sticky top-16 z-30 -mx-6 w-[calc(100%+3rem)] border-b border-line bg-base/85 px-6 py-3 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-1" role="search">
                    <input
                        ref={inputRef}
                        type="search"
                        name="search"
                        value={inputValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            // Esc clears the search, a second Esc leaves the field
                            if (e.key !== 'Escape') return
                            if (inputValue) handleClear()
                            else e.currentTarget.blur()
                        }}
                        placeholder="Search 900k+ games..."
                        aria-label="Search games"
                        className="h-11 w-full rounded-md border border-line bg-surface px-4 pl-11 text-fg transition-colors placeholder:text-subtle focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                    />
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />

                    {!inputValue && <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface-2 px-1.5 font-mono text-xs text-subtle sm:block">/</kbd>}

                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded bg-surface-2 px-2 py-1 text-xs text-muted transition-colors hover:text-fg"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </form>

                <p className="shrink-0 font-mono text-xs text-muted" aria-live="polite">
                    {searchQuery
                        ? <>{totalGames.toLocaleString("en-US")} results</>
                        : <>{totalGames.toLocaleString("en-US")} games</>}
                </p>
            </div>
        </section>
    )
}
