"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dices, Loader2, Play, RotateCcw } from "lucide-react"
import { toast } from "react-toastify"
import { updateShelf } from "@/app/shelf/actions"
import { getCroppedImageUrl } from "@/utils/image"
import Button from "@/components/ui/Button"

type Item = { id: string; title: string; slug: string; backgroundImage: string | null }

const SPIN_STEPS = 12
const SPIN_INTERVAL_MS = 70

// Any index but the current one, so a reroll always lands somewhere new
function randomIndex(length: number, exclude: number | null) {
    if (length < 2 || exclude === null) return Math.floor(Math.random() * length)
    const i = Math.floor(Math.random() * (length - 1))
    return i >= exclude ? i + 1 : i
}

// "What should I play?": rolls through the backlog and lands on one planned game
export default function RandomPick({ items }: { items: Item[] }) {
    const router = useRouter()
    const [index, setIndex] = useState<number | null>(null)
    const [spinning, setSpinning] = useState(false)
    const [isPending, startTransition] = useTransition()
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => () => {
        if (timer.current) clearInterval(timer.current)
    }, [])

    const roll = () => {
        const final = randomIndex(items.length, index)
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setIndex(final)
            return
        }

        setSpinning(true)
        let step = 0
        timer.current = setInterval(() => {
            step++
            if (step >= SPIN_STEPS) {
                clearInterval(timer.current!)
                setIndex(final)
                setSpinning(false)
                return
            }
            setIndex((i) => ((i ?? 0) + 1) % items.length)
        }, SPIN_INTERVAL_MS)
    }

    const startPlaying = (item: Item) => {
        startTransition(async () => {
            const result = await updateShelf(item.id, { status: "PLAYING" })
            if (!result.ok) {
                toast.error(result.error)
                return
            }
            toast.success(`Have fun with ${item.title}!`)
            router.push(`/shelf/${item.slug}`)
        })
    }

    const picked = index !== null ? items[index] : null

    return (
        <section className="rounded-lg border border-line bg-surface p-5">
            {!picked ? (
                <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                    <div>
                        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Can&apos;t decide?</h2>
                        <p className="text-sm text-muted">Let the dice pick from your {items.length} planned games.</p>
                    </div>
                    <Button onClick={roll}>
                        <Dices className="h-4 w-4" /> Pick for me
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md border border-line sm:w-48">
                        {picked.backgroundImage && (
                            <Image
                                src={getCroppedImageUrl(picked.backgroundImage, 600)}
                                alt=""
                                fill
                                sizes="(min-width: 640px) 192px, 100vw"
                                className={`object-cover transition-opacity ${spinning ? "opacity-60" : ""}`}
                            />
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div aria-live="polite">
                            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
                                {spinning ? "Rolling…" : "Tonight you play"}
                            </p>
                            {spinning ? (
                                <p className="truncate font-display text-2xl font-bold text-muted">{picked.title}</p>
                            ) : (
                                <Link href={`/shelf/${picked.slug}`} className="block truncate font-display text-2xl font-bold text-fg hover:text-accent">
                                    {picked.title}
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => startPlaying(picked)} disabled={spinning || isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                Start playing
                            </Button>
                            <Button size="sm" variant="secondary" onClick={roll} disabled={spinning || isPending || items.length < 2}>
                                <RotateCcw className="h-4 w-4" /> Reroll
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
