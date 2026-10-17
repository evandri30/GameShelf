import Image from "next/image"
import Link from "next/link"
import { ListChecks } from "lucide-react"
import { getCroppedImageUrl } from "@/utils/image"

export type ListPreview = {
    id: string
    name: string
    description: string | null
    _count: { items: number }
    items: { shelf: { backgroundImage: string | null } }[]
}

// List tile with a 2x2 mosaic of its most recent covers
export default function ListCard({ list, href }: { list: ListPreview; href?: string }) {
    const covers = list.items.map((i) => i.shelf.backgroundImage).filter(Boolean) as string[]

    const body = (
        <>
            <div className="grid aspect-video grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-t-lg bg-surface-2">
                {covers.length === 0 ? (
                    <div className="col-span-2 row-span-2 flex items-center justify-center text-subtle">
                        <ListChecks className="h-8 w-8" />
                    </div>
                ) : (
                    covers.slice(0, 4).map((src, i) => (
                        <div
                            key={i}
                            // a single cover fills the tile; three covers let the first one span the left column
                            className={`relative ${covers.length === 1 ? "col-span-2 row-span-2" : covers.length === 3 && i === 0 ? "row-span-2" : covers.length === 2 ? "row-span-2" : ""}`}
                        >
                            <Image src={getCroppedImageUrl(src, 420)} alt="" fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
                        </div>
                    ))
                )}
            </div>
            <div className="space-y-1 p-4">
                <p className="line-clamp-1 font-display text-lg font-semibold text-fg group-hover:text-accent">{list.name}</p>
                <p className="font-mono text-xs text-muted">{list._count.items} {list._count.items === 1 ? "game" : "games"}</p>
                {list.description && <p className="line-clamp-2 text-sm text-muted">{list.description}</p>}
            </div>
        </>
    )

    const className = "group block overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-accent/50 hover:shadow-glow"
    return href ? <Link href={href} className={className}>{body}</Link> : <div className={className}>{body}</div>
}
