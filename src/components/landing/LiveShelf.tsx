"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { gotyWinners } from "@/constants/gotywinner"
import { STATUS_META } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"

type Column = "PLANNED" | "PLAYING" | "COMPLETED"
type Card = { id: number; title: string; image: string; status: Column; rating: number; leaving?: boolean; justFinished?: boolean }

const COLUMNS: Column[] = ["PLANNED", "PLAYING", "COMPLETED"]
const STEP_MS = 2800
const MAX_COMPLETED = 3

const games = gotyWinners.filter((g) => g.background_image)
const toCard = (i: number, status: Column): Card => {
    const g = games[i % games.length]
    // a believable spread of ratings for the demo
    return { id: g.id, title: g.name, image: g.background_image!, status, rating: g.rating >= 4.4 ? 5 : 4 }
}

const INITIAL: Card[] = [
    toCard(0, "PLANNED"), toCard(1, "PLANNED"), toCard(2, "PLANNED"),
    toCard(3, "PLAYING"),
    toCard(4, "COMPLETED"), toCard(5, "COMPLETED"),
]

// One tick of the demo: everything moves one column right. The game being played is finished,
// the next planned one starts, a new game joins the backlog and the oldest finished one fades out.
function advance(cards: Card[], nextGame: number): { cards: Card[]; finished: boolean } {
    const kept: Card[] = cards.filter((c) => !c.leaving).map((c) => ({ ...c, justFinished: false }))

    let finished = false
    const playing = kept.findIndex((c) => c.status === "PLAYING")
    if (playing !== -1) {
        const [card] = kept.splice(playing, 1)
        // finished games go on top of the Completed column
        const firstDone = kept.findIndex((c) => c.status === "COMPLETED")
        kept.splice(firstDone === -1 ? kept.length : firstDone, 0, { ...card, status: "COMPLETED", justFinished: true })
        finished = true
    }

    const planned = kept.findIndex((c) => c.status === "PLANNED")
    if (planned !== -1) kept[planned] = { ...kept[planned], status: "PLAYING" }

    const lastPlanned = kept.findLastIndex((c) => c.status === "PLANNED")
    kept.splice(lastPlanned === -1 ? 0 : lastPlanned + 1, 0, toCard(nextGame, "PLANNED"))

    const done = kept.filter((c) => c.status === "COMPLETED")
    const oldest = done.length > MAX_COMPLETED ? done[done.length - 1] : null
    return { cards: kept.map((c) => (c === oldest ? { ...c, leaving: true } : c)), finished }
}

function Stars({ rating, animate }: { rating: number; animate: boolean }) {
    return (
        <span className="flex gap-0.5" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    aria-hidden
                    className={`h-3 w-3 ${i < rating ? "fill-accent text-accent" : "text-line-strong"} ${animate && i < rating ? "animate-star-pop" : ""}`}
                    style={animate ? { animationDelay: `${350 + i * 110}ms` } : undefined}
                />
            ))}
        </span>
    )
}

// A small, self-playing version of the shelf: the hero shows the product instead of describing it
export default function LiveShelf() {
    const [cards, setCards] = useState(INITIAL)
    const [finishedCount, setFinishedCount] = useState(14)
    const [paused, setPaused] = useState(false)
    const [visible, setVisible] = useState(true)
    const [reduced, setReduced] = useState(false)

    const boardRef = useRef<HTMLDivElement>(null)
    const nodes = useRef(new Map<number, HTMLLIElement>())
    const rects = useRef(new Map<number, DOMRect>())
    const cardsRef = useRef(INITIAL)
    const nextGame = useRef(INITIAL.length)

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(media.matches)
        sync()
        media.addEventListener("change", sync)

        // stop when scrolled away, so the loop never runs unseen
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
        if (boardRef.current) observer.observe(boardRef.current)

        return () => {
            media.removeEventListener("change", sync)
            observer.disconnect()
        }
    }, [])

    useEffect(() => {
        if (reduced || paused || !visible) return
        const timer = setInterval(() => {
            if (document.hidden) return
            // remember where every card is, so the layout effect can slide them from there (FLIP)
            rects.current = new Map([...nodes.current].map(([id, el]) => [id, el.getBoundingClientRect()]))

            // skip games still on the board, so every card id stays unique
            const onBoard = new Set(cardsRef.current.map((c) => c.id))
            while (onBoard.has(games[nextGame.current % games.length].id)) nextGame.current++

            const result = advance(cardsRef.current, nextGame.current)
            nextGame.current++
            if (result.finished) setFinishedCount((n) => n + 1)
            cardsRef.current = result.cards
            setCards(result.cards)
        }, STEP_MS)
        return () => clearInterval(timer)
    }, [reduced, paused, visible])

    useLayoutEffect(() => {
        const before = rects.current
        if (!before.size) return
        for (const [id, el] of nodes.current) {
            const prev = before.get(id)
            if (!prev) {
                el.animate([{ opacity: 0, transform: "translateY(-8px) scale(0.96)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" })
                continue
            }
            const now = el.getBoundingClientRect()
            const dx = prev.left - now.left
            const dy = prev.top - now.top
            if (dx || dy) {
                el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" })
            }
        }
        rects.current = new Map()
    }, [cards])

    return (
        <div
            ref={boardRef}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            className="w-full rounded-xl border border-line bg-surface/80 p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-4"
        >
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-fg">My shelf</p>
                <p className="text-xs text-muted" aria-live="off">
                    Finished this year{" "}
                    <span key={finishedCount} className="inline-block animate-bump font-mono text-sm font-bold text-accent">{finishedCount}</span>
                </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {COLUMNS.map((column) => {
                    const items = cards.filter((c) => c.status === column)
                    return (
                        <section key={column} aria-label={STATUS_META[column].label} className="flex min-w-0 flex-col rounded-lg bg-base/60 p-1.5 sm:p-2">
                            <h3 className="mb-2 flex items-center gap-1.5 px-0.5 text-[11px] font-medium text-muted sm:text-xs">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_META[column].color }} />
                                <span className="truncate">{STATUS_META[column].label}</span>
                                <span className="ml-auto hidden font-mono text-subtle sm:inline">{items.filter((c) => !c.leaving).length}</span>
                            </h3>
                            {/* Completed can briefly hold an extra card while the oldest fades out; contain-size keeps it
                                from stretching the board, so it is clipped instead */}
                            <ul className={`flex min-h-56 flex-1 flex-col gap-2 sm:min-h-64 ${column === "COMPLETED" ? "overflow-hidden contain-size" : ""}`}>
                                {items.map((card) => (
                                    <li
                                        key={card.id}
                                        ref={(el) => {
                                            if (el) nodes.current.set(card.id, el)
                                            else nodes.current.delete(card.id)
                                        }}
                                        className={`shrink-0 overflow-hidden rounded-md border bg-surface transition-[opacity,border-color] duration-500
                                            ${card.leaving ? "opacity-0" : "opacity-100"}
                                            ${card.justFinished ? "border-accent/60" : "border-line"}`}
                                    >
                                        <div className="relative aspect-video">
                                            <Image src={getCroppedImageUrl(card.image, 420)} alt="" fill sizes="(min-width: 1024px) 170px, 30vw" className="object-cover" />
                                            {card.status === "PLAYING" && (
                                                <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left animate-playing bg-status-playing" aria-hidden />
                                            )}
                                        </div>
                                        <div className="space-y-1 p-1.5 sm:p-2">
                                            <p className="truncate text-[11px] font-medium text-fg sm:text-xs">{card.title}</p>
                                            {card.status === "COMPLETED" && <Stars rating={card.rating} animate={!!card.justFinished} />}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                })}
            </div>
        </div>
    )
}
