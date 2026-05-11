"use client";

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

type SearchBarProps = {
    searchQuery: string;
    totalGames: number;
}

export default function SearchBar({ searchQuery, totalGames }: SearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

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
        const current = new URLSearchParams(Array.from(searchParams.entries()))
        if (value) {
            current.set('search', value)
        } else {
            current.delete('search')
        }
        // Always reset to page 1 when searching
        current.delete('page')

        const search = current.toString()
        const query = search ? `?${search}` : ''
        router.push(`/games${query}`)
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
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition"
                    >
                        <X className="w-3 h-3" />
                        clear
                    </button>
                )}
            </form>

            {searchQuery && (
                <p className='mt-4 text-sm text-zinc-500'>Found {totalGames.toLocaleString()} result(s) for "{searchQuery}"</p>
            )}
        </section>
    )
}