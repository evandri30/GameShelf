import Link from "next/link"
import Image from "next/image";
import type { GameProps } from "@/types"
import { getCroppedImageUrl } from "@/utils/image"

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
            className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:-translate-y-1 hover:border-zinc-600 transition"
        >
            {/* Thumbnail */}
            <div className="relative w-full h-40">
                {game.background_image ? (
                    <Image
                        src={getCroppedImageUrl(game.background_image)}
                        alt={game.name}
                        loading="lazy"
                        priority={false}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                        No Image
                    </div>
                )}

                {/* Metacritic Badge */}
                {game.metacritic && (
                    <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-md border
                  ${game.metacritic >= 75
                            ? "border-green-500 text-green-400"
                            : game.metacritic >= 50
                                ? "border-yellow-500 text-yellow-400"
                                : "border-red-500 text-red-400"
                        }`}>
                        {game.metacritic}
                    </span>
                )}

                {/* ESRB Badge */}
                {game.esrb_rating && (
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-700 text-zinc-400">
                        {game.esrb_rating.name}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                <h2 className="font-semibold text-white text-sm leading-snug line-clamp-2">
                    {game.name}
                </h2>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                    {game.genres.slice(0, 2).map((genre) => (
                        <span
                            key={genre.id}
                            className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400"
                        >
                            {genre.name}
                        </span>
                    ))}
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1">
                    {game.platforms?.slice(0, 3).map(({ platform }) => (
                        <span
                            key={platform.id}
                            className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500"
                        >
                            {platform.name}
                        </span>
                    ))}
                    {game.platforms?.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                            +{game.platforms.length - 3}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                    <span>⭐ {game.rating.toFixed(1)}</span>
                    <span>{game.released?.slice(0, 4) ?? "N/A"}</span>
                </div>
            </div>
        </Link>
    )
}