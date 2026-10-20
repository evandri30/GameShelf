'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function DiscoverError({ error, retry }: { error: unknown; retry: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
            <h2 className="text-2xl font-semibold">Couldn&apos;t load games</h2>
            <p className="text-muted">The game database is slow or unavailable right now. Give it another try in a moment.</p>
            <Button onClick={() => retry()}>Try again</Button>
        </div>
    )
}
