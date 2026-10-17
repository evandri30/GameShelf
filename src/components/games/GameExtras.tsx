import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Images, Layers, ShoppingBag } from "lucide-react"
import type { GameDetailProps } from "@/types"
import { getGameScreenshots, getGameSeries, getGameStoreLinks } from "@/lib/rawg"
import { getCroppedImageUrl } from "@/utils/image"
import { Card, SectionHeading, Skeleton } from "@/components/ui/Card"
import ScreenshotGallery from "./ScreenshotGallery"

// Each section fetches its own data and streams in behind a <Suspense> on the detail page.
// A failed request just hides the section instead of breaking the page.

export async function Screenshots({ game }: { game: GameDetailProps }) {
    const shots = await getGameScreenshots(game.id).catch(() => [])
    if (!shots.length) return null

    return (
        <section className="space-y-4">
            <SectionHeading title="Screenshots" icon={Images} />
            <ScreenshotGallery shots={shots} title={game.name} />
        </section>
    )
}

export async function StoreLinks({ game }: { game: GameDetailProps }) {
    if (!game.stores.length) return null
    const stores = await getGameStoreLinks(game.id, game.stores).catch(() => [])
    if (!stores.length) return null

    return (
        <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
                <ShoppingBag className="h-4 w-4 text-accent" /> Where to buy
            </h2>
            <ul className="space-y-2">
                {stores.map((store) => (
                    <li key={store.id}>
                        <a
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
                        >
                            {store.name}
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

export async function SeriesRail({ game }: { game: GameDetailProps }) {
    const series = await getGameSeries(game.id).catch(() => [])
    if (!series.length) return null

    return (
        <section className="space-y-4">
            <SectionHeading title="Also in the series" icon={Layers} />
            <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
                {series.map((g) => (
                    <Link
                        key={g.id}
                        href={`/games/${g.slug}`}
                        className="group w-60 shrink-0 snap-start overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent/60"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            {g.background_image ? (
                                <Image src={getCroppedImageUrl(g.background_image)} alt="" fill sizes="240px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="h-full w-full bg-surface-2" />
                            )}
                        </div>
                        <div className="p-3">
                            <p className="line-clamp-1 text-sm font-semibold text-fg group-hover:text-accent">{g.name}</p>
                            <p className="font-mono text-xs text-muted">{g.released?.slice(0, 4) ?? "TBA"}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export function SectionSkeleton({ className = "h-48" }: { className?: string }) {
    return <Skeleton className={`w-full rounded-lg ${className}`} />
}
