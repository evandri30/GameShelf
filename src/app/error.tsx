'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

// Fallback for every page without its own error.tsx (shelf, stats, profile, public profiles)
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="text-muted">We couldn&apos;t load this page. Give it another try in a moment.</p>
            <Button onClick={() => retry()}>Try again</Button>
        </div>
    )
}
