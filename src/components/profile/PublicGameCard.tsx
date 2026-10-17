import Image from "next/image"
import Link from "next/link"
import { Clock, Star } from "lucide-react"
import { getCroppedImageUrl } from "@/utils/image"

type Props = {
    game: { title: string; slug: string; backgroundImage: string | null; rating: number | null; playtime: number | null }
}

// Read-only shelf card for public pages; links to the game itself, not the owner's private shelf entry
export default function PublicGameCard({ game }: Props) {
    return (
        <Link
            href={`/games/${game.slug}`}
            className="group block overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-accent/50 hover:shadow-glow"
        >
            <div className="relative aspect-video overflow-hidden">
                {game.backgroundImage ? (
                    <Image src={getCroppedImageUrl(game.backgroundImage)} alt="" fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="h-full w-full bg-surface-2" />
                )}
            </div>
            <div className="space-y-1 p-3">
                <p className="line-clamp-1 text-sm font-semibold text-fg group-hover:text-accent">{game.title}</p>
                <p className="flex items-center gap-3 font-mono text-xs text-muted">
                    <span className="flex items-center gap-1">
                        <Star className={`h-3.5 w-3.5 ${game.rating ? "fill-accent text-accent" : ""}`} aria-hidden />
                        {game.rating ? `${game.rating}/5` : "–"}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{game.playtime ?? 0}h</span>
                </p>
            </div>
        </Link>
    )
}
