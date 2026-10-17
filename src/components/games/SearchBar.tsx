"use client";

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

type SearchBarProps = {
    searchQuery: string;
    totalGames: number;
}

export default function SearchBar({ searchQuery, totalGames }: SearchBarProps) {
    const router = useRouter()

    const [inputValue, setInputValue] = useState(searchQuery || '')
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const lastPushedQuery = useRef(searchQuery || '')

    // Sync state only if the URL changed from outside (e.g., Back/Forward navigation)
    useEffect(() => {
        if (lastPushedQuery.current !== (searchQuery || '')) {
            setInputValue(searchQuery || '')
            lastPushedQuery.current = searchQuery || ''
        }
    }, [searchQuery])

    const updateSearch = (value: string) => {
        lastPushedQuery.current = value
        // A new search always starts from page 1, so the only param kept is the query itself
        router.push(value ? `/games?${new URLSearchParams({ search: value })}` : '/games')
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
        setInputValue('')
        updateSearch('')
    }

    return (
        <section className="mt-12 w-full max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    name="search"
                    value={inputValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="search games...."
                    aria-label="Search games"
                    className="w-full rounded-md border border-line bg-surface px-4 py-3 pl-12 text-fg transition-colors placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />

                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded bg-surface-2 px-2 py-1 text-xs text-muted transition-colors hover:text-fg"
                    >
                        <X className="w-3 h-3" />
                        clear
                    </button>
                )}
            </form>

            {searchQuery && (
                <p className='mt-4 text-sm text-muted'>Found {totalGames.toLocaleString()} result(s) for &quot;{searchQuery}&quot;</p>
            )}
        </section>
    )
}