"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUp, GripVertical, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { reorderBacklog } from "@/app/shelf/actions"
import { getCroppedImageUrl } from "@/utils/image"

type Item = { id: string; title: string; slug: string; backgroundImage: string | null }

function move<T>(list: T[], from: number, to: number) {
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
}

// Drag to reorder on desktop; the arrow buttons cover touch screens and keyboards
export default function BacklogList({ items: initial }: { items: Item[] }) {
    const [items, setItems] = useState(initial)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [overIndex, setOverIndex] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()

    const commit = (next: Item[]) => {
        const previous = items
        setItems(next)
        startTransition(async () => {
            const result = await reorderBacklog(next.map((i) => i.id))
            if (!result.ok) {
                setItems(previous)
                toast.error(result.error)
            }
        })
    }

    const shift = (index: number, delta: number) => {
        const to = index + delta
        if (to < 0 || to >= items.length) return
        commit(move(items, index, to))
    }

    return (
        <div className="space-y-3">
            <p className="flex h-5 items-center gap-2 text-xs text-muted" aria-live="polite">
                {isPending && <><Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Saving order…</>}
            </p>

            <ol className="space-y-2">
                {items.map((item, index) => (
                    <li
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                            setDragIndex(index)
                            e.dataTransfer.effectAllowed = "move"
                        }}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setOverIndex(index)
                        }}
                        onDragEnd={() => {
                            setDragIndex(null)
                            setOverIndex(null)
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            if (dragIndex !== null && dragIndex !== index) commit(move(items, dragIndex, index))
                            setDragIndex(null)
                            setOverIndex(null)
                        }}
                        className={`flex items-center gap-3 rounded-lg border bg-surface p-2 pr-3 transition-colors
                            ${dragIndex === index ? "opacity-40" : ""}
                            ${overIndex === index && dragIndex !== index ? "border-accent" : "border-line"}`}
                    >
                        <GripVertical className="hidden h-5 w-5 shrink-0 cursor-grab text-subtle active:cursor-grabbing sm:block" aria-hidden />
                        <span className={`w-8 shrink-0 text-center font-mono text-lg font-bold ${index === 0 ? "text-accent" : "text-subtle"}`}>{index + 1}</span>
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded border border-line">
                            {item.backgroundImage && <Image src={getCroppedImageUrl(item.backgroundImage, 200)} alt="" fill sizes="96px" loading={index < 3 ? "eager" : undefined} className="object-cover" />}
                        </div>
                        <Link href={`/shelf/${item.slug}`} className="min-w-0 flex-1 truncate font-medium text-fg hover:text-accent">
                            {item.title}
                        </Link>
                        <div className="flex shrink-0 gap-1">
                            <button
                                type="button"
                                onClick={() => shift(index, -1)}
                                disabled={index === 0}
                                aria-label={`Move ${item.title} up`}
                                className="cursor-pointer rounded p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:invisible"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => shift(index, 1)}
                                disabled={index === items.length - 1}
                                aria-label={`Move ${item.title} down`}
                                className="cursor-pointer rounded p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:invisible"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    )
}
