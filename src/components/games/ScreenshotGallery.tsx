"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getCroppedImageUrl } from "@/utils/image"

type Shot = { id: number; image: string }

// Thumbnail grid + native <dialog> lightbox with arrow-key navigation
export default function ScreenshotGallery({ shots, title }: { shots: Shot[]; title: string }) {
    const [index, setIndex] = useState<number | null>(null)
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (index !== null && !dialog.open) dialog.showModal()
        if (index === null && dialog.open) dialog.close()
    }, [index])

    const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + shots.length) % shots.length))

    return (
        <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {shots.map((shot, i) => (
                    <button
                        key={shot.id}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Open screenshot ${i + 1} of ${shots.length}`}
                        className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-md border border-line transition-colors hover:border-accent/60"
                    >
                        <Image
                            src={getCroppedImageUrl(shot.image, 420)}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </button>
                ))}
            </div>

            <dialog
                ref={dialogRef}
                aria-label={`${title} screenshots`}
                onClose={() => setIndex(null)}
                onKeyDown={(e) => {
                    if (e.key === "ArrowRight") step(1)
                    if (e.key === "ArrowLeft") step(-1)
                }}
                onClick={(e) => e.target === e.currentTarget && setIndex(null)}
                className="m-auto w-[min(96vw,80rem)] bg-transparent p-0 backdrop:bg-black/90 backdrop:backdrop-blur-sm"
            >
                {index !== null && (
                    <div className="relative">
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                            <Image
                                src={getCroppedImageUrl(shots[index].image, 1920)}
                                alt={`${title} screenshot ${index + 1}`}
                                fill
                                sizes="96vw"
                                className="object-contain"
                            />
                        </div>
                        <p className="mt-3 text-center font-mono text-xs text-muted">{index + 1} / {shots.length}</p>

                        <button type="button" onClick={() => setIndex(null)} aria-label="Close" className="absolute right-3 top-3 cursor-pointer rounded-full bg-base/80 p-2 text-fg hover:text-accent">
                            <X className="h-5 w-5" />
                        </button>
                        {shots.length > 1 && (
                            <>
                                <button type="button" onClick={() => step(-1)} aria-label="Previous screenshot" className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-base/80 p-2 text-fg hover:text-accent">
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button type="button" onClick={() => step(1)} aria-label="Next screenshot" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-base/80 p-2 text-fg hover:text-accent">
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </dialog>
        </>
    )
}
