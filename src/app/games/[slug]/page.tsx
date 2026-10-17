import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'
import { getGameBySlug } from '@/lib/rawg'
import Backdrop from '@/components/Backdrop';
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

    const fromSearch = search.from == 'search' && search.q
    const backUrl = fromSearch ? `/games?${new URLSearchParams({ search: search.q!, page: search.page || '1' })}` : '/games'

    return (
        <div className="relative isolate -mt-16 animate-fade-up pt-16">
            <Backdrop src={game.background_image} />

            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
                <Link href={backUrl} className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                    <ArrowLeft className='h-4 w-4' />
                    {fromSearch ? 'Back to results' : 'Back to Discover'}
                </Link>

                <GameHeaderDetail game={game} slug={slug} />

                <GameContentDetail game={game} />
            </div>
        </div>
    )
}
