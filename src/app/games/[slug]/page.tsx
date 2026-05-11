import { getGameBySlug } from '@/lib/rawg'
import { FadeIn } from '@/components/AnimatedSection';
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

    const backUrl = search.from == 'search' && search.q ? `/games?search=${search.q}&page=${search.page || 1}` : '/games'

    return (
        <FadeIn>
            <main className='relative min-h-screen overflow-hidden px-6 py-16 flex flex-col items-center'>
                <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]' />

                {/* Back Button */}
                <div className="w-full max-w-6xl mb-8">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition"
                    >
                        <ArrowLeft className='w-4 h-4' />
                        Back to {search.from == 'search' ? `Search Results` : `Search`}
                    </Link>
                </div>

                {/* Hero Section */}
                <GameHeaderDetail game={game} slug={slug} />

                {/* Main Content */}
                <GameContentDetail game={game} />
            </main>
        </FadeIn>
    )
}