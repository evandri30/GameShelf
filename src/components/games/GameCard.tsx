import Link from "next/link"
import Image from "next/image";
import { Star } from "lucide-react"
import type { GameProps } from "@/types"
import { getCroppedImageUrl } from "@/utils/image"
import { MetacriticBadge } from "@/components/ui/Badge"
import QuickAddButton from "./QuickAddButton"

type GameCardProps = {
    game: GameProps
    searchQuery?: string;
    currentPage: number
    eager?: boolean
}

export function gameHref(slug: string, searchQuery?: string, currentPage?: number) {
    if (!searchQuery) return `/games/${slug}`
    return `/games/${slug}?${new URLSearchParams({ from: "search", q: searchQuery, page: String(currentPage ?? 1) })}`
}

// Cover art first: title over the image, details slide in on hover.
// The link is stretched over the card so the quick-add button can sit on top without nesting interactive elements.
export default function GameCard({ game, searchQuery, currentPage, eager = false }: GameCardProps) {
    return (
        <article className="group relative aspect-video overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-accent/60 hover:shadow-glow">
            {game.background_image ? (
                <Image
                    src={getCroppedImageUrl(game.background_image)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading={eager ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-2 text-sm text-subtle">No Image</div>
            )}

            <div className="absolute inset-0 bg-linear-to-t from-base via-base/40 to-transparent" />

            {/* Top row */}
            <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between">
                {game.metacritic ? <MetacriticBadge score={game.metacritic} /> : <span />}
                <div className="opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                    <QuickAddButton rawgId={game.id} title={game.name} slug={game.slug} backgroundImage={game.background_image} />
                </div>
            </div>

            {/* Bottom: title always visible, meta revealed on hover */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                <h2 className="line-clamp-2 font-display text-lg font-semibold leading-tight text-fg drop-shadow">
                    <Link href={gameHref(game.slug, searchQuery, currentPage)} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {game.name}
                    </Link>
                </h2>
                <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted">
                    <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {game.rating.toFixed(1)}
                    </span>
                    <span>{game.released?.slice(0, 4) ?? "TBA"}</span>
                    {game.genres[0] && <span className="truncate font-sans">{game.genres.slice(0, 2).map((g) => g.name).join(" · ")}</span>}
                </div>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                        <div className="flex flex-wrap gap-1 pt-2">
                            {game.platforms.slice(0, 4).map(({ platform }) => (
                                <span key={platform.id} className="rounded bg-base/70 px-2 py-0.5 text-[11px] text-muted">
                                    {platform.name}
                                </span>
                            ))}
                            {game.platforms.length > 4 && (
                                <span className="rounded bg-base/70 px-2 py-0.5 text-[11px] text-muted">+{game.platforms.length - 4}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* keyboard focus ring for the stretched link */}
            <div className="pointer-events-none absolute inset-0 z-30 rounded-lg ring-accent group-has-[a:focus-visible]:ring-2" />
        </article>
    )
}
