import { getGameBySlug } from '@/lib/rawg'
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'
import GameHeaderDetail from '@/components/games/GameHeaderDetail';
import GameContentDetail from '@/components/games/GameContentDetail';

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ from?: string; q?: string; page?: string }>
}

export default async function DetailGamePage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const search = await searchParams;
    const game = await getGameBySlug(slug);

    const backUrl = search.from == 'search' && search.q ? `/games?${new URLSearchParams({ search: search.q, page: search.page || '1' })}` : '/games'

    return (
        <div className='relative flex min-h-screen animate-fade-up flex-col items-center px-6 py-16'>
            {/* Back Button */}
            <div className="mb-8 w-full max-w-6xl">
                <Link
                    href={backUrl}
                    className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
                >
                    <ArrowLeft className='h-4 w-4' />
                    Back to {search.from == 'search' ? `Search Results` : `Games`}
                </Link>
            </div>

            {/* Hero Section */}
            <GameHeaderDetail game={game} slug={slug} />

            {/* Main Content */}
            <GameContentDetail game={game} />
        </div>
    )
}
