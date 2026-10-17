import Image from 'next/image';
import { Star } from 'lucide-react';
import AddToShelfButton from './AddToShelfButton';
import type { GameDetailProps } from "@/types"
import { getCroppedImageUrl } from '@/utils/image';
import { Badge, MetacriticBadge } from '@/components/ui/Badge';

type Props = {
    game: GameDetailProps;
    slug: string;
}

export default function PageHeaderDetail({ game, slug }: Props) {
    const year = game.released?.slice(0, 4)
    const studio = game.developers[0]?.name

    return (
        <section className="grid w-full items-end gap-8 md:grid-cols-[1.3fr_1fr]">
            {/* Key art */}
            <div className="relative aspect-video overflow-hidden rounded-lg border border-line shadow-2xl shadow-black/60">
                {game.background_image ? (
                    <Image
                        src={getCroppedImageUrl(game.background_image, 1280)}
                        alt={game.name}
                        fill
                        // the key art is the LCP element of this page
                        preload
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-subtle">No Image Available</div>
                )}
            </div>

            {/* Title + actions */}
            <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    {game.metacritic && <MetacriticBadge score={game.metacritic} label />}
                    {game.esrb_rating && <Badge>{game.esrb_rating.name}</Badge>}
                </div>

                <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl lg:text-6xl">
                    {game.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="flex items-center gap-1 font-mono text-fg">
                        <Star className="h-4 w-4 fill-accent text-accent" aria-hidden /> {game.rating.toFixed(1)}
                        <span className="text-muted">/ {game.rating_top}</span>
                    </span>
                    {year && <span className="font-mono">{year}</span>}
                    {studio && <span>{studio}</span>}
                </div>

                <AddToShelfButton
                    rawgId={game.id}
                    title={game.name}
                    slug={slug}
                    backgroundImage={game.background_image}
                />
            </div>
        </section>
    )
}
