import Link from "next/link"
import Image from "next/image";
import { Star } from "lucide-react"
import type { GameProps } from "@/types"
import { getCroppedImageUrl } from "@/utils/image"
import { Badge, MetacriticBadge } from "@/components/ui/Badge"

type GameCardProps = {
    game: GameProps
    searchQuery?: string;
    currentPage: number
}

export default function GameCard({ game, searchQuery, currentPage }: GameCardProps) {
    return (
        <Link
            href={`/games/${game.slug}${searchQuery ? `?from=search&q=${searchQuery}&page=${currentPage}` : ``}`}
            key={game.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-accent/60 hover:shadow-glow"
        >
            {/* Thumbnail */}
            <div className="relative h-40 w-full overflow-hidden">
                {game.background_image ? (
                    <Image
                        src={getCroppedImageUrl(game.background_image)}
                        alt={game.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-sm text-subtle">
                        No Image
                    </div>
                )}

                {game.metacritic && <MetacriticBadge score={game.metacritic} className="absolute right-2 top-2" />}

                {game.esrb_rating && <Badge className="absolute bottom-2 left-2 border-line-strong bg-base/80 text-muted">{game.esrb_rating.name}</Badge>}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-fg transition-colors group-hover:text-accent">
                    {game.name}
                </h2>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                    {game.genres.slice(0, 2).map((genre) => (
                        <span key={genre.id} className="rounded border border-line-strong px-2 py-0.5 text-xs text-muted">
                            {genre.name}
                        </span>
                    ))}
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1">
                    {game.platforms?.slice(0, 3).map(({ platform }) => (
                        <span key={platform.id} className="rounded bg-surface-2 px-2 py-0.5 text-xs text-subtle">
                            {platform.name}
                        </span>
                    ))}
                    {game.platforms?.length > 3 && (
                        <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-subtle">
                            +{game.platforms.length - 3}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3 font-mono text-xs text-muted">
                    <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {game.rating.toFixed(1)}
                    </span>
                    <span>{game.released?.slice(0, 4) ?? "N/A"}</span>
                </div>
            </div>
        </Link>
    )
}
