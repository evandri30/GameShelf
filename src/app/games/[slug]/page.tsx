import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'
import { getGameBySlug } from '@/lib/rawg'
import { getCroppedImageUrl } from '@/utils/image'
import { getSession } from '@/auth';
import { getUserShelfIndex, type ShelfIndex } from '@/services/shelf.service';
import Backdrop from '@/components/Backdrop';
import GameHeaderDetail from '@/components/games/GameHeaderDetail';
import GameContentDetail from '@/components/games/GameContentDetail';
import { Screenshots, SectionSkeleton, SeriesRail, StoreLinks } from '@/components/games/GameExtras';

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ back?: string }>
}

// getGameBySlug is cached, so the page render below reuses this lookup
export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
    const { slug } = await params
    const game = await getGameBySlug(slug).catch(() => null)
    if (!game) return { title: 'Game not found | GameShelf' }

    // the description is sanitized HTML; previews want plain text
    const text = game.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const description = text.length > 160 ? `${text.slice(0, 157)}...` : text

    return {
        title: `${game.name} | GameShelf`,
        description,
        openGraph: {
            title: game.name,
            description,
            images: game.background_image ? [getCroppedImageUrl(game.background_image, 1280, 720)] : [],
        },
    }
}

// Only accept in-app Discover URLs as the "back" target
function safeBackHref(back?: string) {
    return back && back.startsWith('/games') && !back.startsWith('//') ? back : '/games'
}

export default async function DetailGamePage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { back } = await searchParams;

    const [game, shelfIndex] = await Promise.all([
        getGameBySlug(slug),
        getSession().then((session): Promise<ShelfIndex> | ShelfIndex => session?.user?.id ? getUserShelfIndex(session.user.id) : {}),
    ]);
    if (!game) notFound()
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
