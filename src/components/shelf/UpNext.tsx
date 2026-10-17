import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ListOrdered } from "lucide-react"
import { getCroppedImageUrl } from "@/utils/image"

type Item = { id: string; title: string; slug: string; backgroundImage: string | null }

// The top of the backlog queue, shown above the shelf
export default function UpNext({ items, total }: { items: Item[]; total: number }) {
    if (!items.length) return null

    return (
        <section className="rounded-lg border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide">
                    <ListOrdered className="h-5 w-5 text-accent" aria-hidden /> Up next
                    <span className="font-mono text-xs text-subtle">{total}</span>
                </h2>
                <Link href="/shelf/backlog" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                    Reorder <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {items.map((item, i) => (
                    <li key={item.id}>
                        <Link href={`/shelf/${item.slug}`} className="group flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-surface-2">
                            <span className={`font-mono text-lg font-bold ${i === 0 ? "text-accent" : "text-subtle"}`}>{i + 1}</span>
                            <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded border border-line">
                                {item.backgroundImage && <Image src={getCroppedImageUrl(item.backgroundImage, 200)} alt="" fill sizes="80px" className="object-cover" />}
                            </div>
                            <span className="line-clamp-2 text-sm font-medium text-fg group-hover:text-accent">{item.title}</span>
                        </Link>
                    </li>
                ))}
            </ol>
        </section>
    )
}
