import Image from 'next/image';
import AddToShelfButton from './AddToShelfButton';
import type { GameDetailProps } from "@/types"
import { getCroppedImageUrl } from '@/utils/image';

type Props = {
    game: GameDetailProps;
    slug: string;
}


export default function PageHeaderDetail({ game, slug }: Props) {
    return (
        <section className='w-full max-w-6xl'>
            <div className='relative w-full h-100 rounded-xl overflow-hidden border border-zinc-800'>
                {game.background_image ? (
                    <Image
                        src={getCroppedImageUrl(game.background_image, 1200, 720)}
                        alt={game.name}
                        loading="lazy"
                        priority={false}
                        fill
                        sizes='100vw'
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                        No Image Available
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] mb-4">
                        {game.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        {game.metacritic && (
                            <span className={`text-sm font-bold px-3 py-1 rounded-md border
                                                ${game.metacritic >= 75
                                    ? "border-green-500 text-green-400 bg-green-950/50"
                                    : game.metacritic >= 50
                                        ? "border-yellow-500 text-yellow-400 bg-yellow-950/50"
                                        : "border-red-500 text-red-400 bg-red-950/50"
                                }`}>
                                Metacritic: {game.metacritic}
                            </span>
                        )}
                        {game.esrb_rating && (
                            <span className="text-sm px-3 py-1 rounded-md bg-zinc-900/80 border border-zinc-700 text-zinc-300">
                                {game.esrb_rating.name}
                            </span>
                        )}
                        <span className="text-sm px-3 py-1 rounded-md bg-zinc-900/80 border border-zinc-700 text-zinc-300">
                            ⭐ {game.rating.toFixed(1)} / {game.rating_top}
                        </span>
                        <div>
                            <AddToShelfButton
                                rawgId={game.id}
                                title={game.name}
                                slug={slug}
                                backgroundImage={game.background_image}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}