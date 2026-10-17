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
    return (
        <section className='w-full max-w-6xl'>
            <div className='relative h-100 w-full overflow-hidden rounded-lg border border-line'>
                {game.background_image ? (
                    <Image
                        src={getCroppedImageUrl(game.background_image, 1280)}
                        alt={game.name}
                        fill
                        // hero image is the LCP element of this page
                        preload
                        sizes='(max-width: 1152px) 100vw, 1152px'
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-subtle">
                        No Image Available
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-base via-base/60 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h1 className="mb-4 font-display text-4xl font-bold tracking-tight drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] md:text-6xl">
                        {game.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        {game.metacritic && <MetacriticBadge score={game.metacritic} label />}
                        {game.esrb_rating && <Badge>{game.esrb_rating.name}</Badge>}
                        <Badge className="border-line-strong bg-base/70 font-mono text-fg">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {game.rating.toFixed(1)} / {game.rating_top}
                        </Badge>
                        <AddToShelfButton
                            rawgId={game.id}
                            title={game.name}
                            slug={slug}
                            backgroundImage={game.background_image}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
