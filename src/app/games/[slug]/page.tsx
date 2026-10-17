import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'
import { getGameBySlug } from '@/lib/rawg'
import { getSession } from '@/auth';
import { getUserShelfIndex } from '@/services/shelf.service';
import Backdrop from '@/components/Backdrop';
import GameHeaderDetail from '@/components/games/GameHeaderDetail';
import GameContentDetail from '@/components/games/GameContentDetail';
import { Screenshots, SectionSkeleton, SeriesRail, StoreLinks } from '@/components/games/GameExtras';

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ back?: string }>
}

// Only accept in-app Discover URLs as the "back" target
function safeBackHref(back?: string) {
    return back && back.startsWith('/games') && !back.startsWith('//') ? back : '/games'
}

export default async function DetailGamePage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { back } = await searchParams;

    const [game, session] = await Promise.all([getGameBySlug(slug), getSession()]);
    const shelfIndex = session?.user?.id ? await getUserShelfIndex(session.user.id) : {}
    const entry = shelfIndex[game.id]

    const backHref = safeBackHref(back)

    return (
        <div className="relative isolate -mt-16 animate-fade-up pt-16">
            <Backdrop src={game.background_image} />

            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
                <Link href={backHref} className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                    <ArrowLeft className='h-4 w-4' />
                    {backHref === '/games' ? 'Back to Discover' : 'Back to results'}
                </Link>

                <GameHeaderDetail game={game} slug={slug} entry={entry} />

                <GameContentDetail
                    game={game}
                    sidebarExtra={
                        <Suspense fallback={<SectionSkeleton className="h-40" />}>
                            <StoreLinks game={game} />
                        </Suspense>
                    }
                />

                <Suspense fallback={<SectionSkeleton />}>
                    <Screenshots game={game} />
                </Suspense>

                <Suspense fallback={<SectionSkeleton className="h-56" />}>
                    <SeriesRail game={game} />
                </Suspense>
            </div>
        </div>
    )
}
