"use client"

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import type { ShelfStatus } from "@/generated/prisma/browser"
import type { ShelfFDetailProps, UpdateShelfInput } from "@/types"
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"
import { updateShelf } from "@/app/shelf/actions"
import { Card } from "@/components/ui/Card"
import StarRating from "@/components/ui/StarRating"

type Props = {
    shelf: ShelfFDetailProps
    // the viewer's zone from the server, so server and client render the same dates
    timeZone: string
    // server-rendered "Add to list" menu
    listsSlot?: React.ReactNode
}

type SaveState = "idle" | "saving" | "saved"

const NOTES_MAX = 1000
const AUTOSAVE_MS = 900

function SaveIndicator({ state }: { state: SaveState }) {
    if (state === "idle") return null
    return (
        <span className="inline-flex items-center gap-1 text-xs text-muted" aria-live="polite">
            {state === "saving"
                ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
                : <><Check className="h-3 w-3 text-accent" /> Saved</>}
        </span>
    )
}

export default function ShelfDetail({ shelf, timeZone, listsSlot }: Props) {
    const [isPending, startTransition] = useTransition()

    // status & rating update instantly and roll back on failure
    const [optimistic, setOptimistic] = useOptimistic(
        { status: shelf.status, rating: shelf.rating ?? 0 },
        (state, patch: Partial<{ status: ShelfStatus; rating: number }>) => ({ ...state, ...patch })
    )

    const [notes, setNotes] = useState(shelf.caption ?? "")
    const [hours, setHours] = useState(String(shelf.playtime ?? 0))
    const [notesState, setNotesState] = useState<SaveState>("idle")
    const [hoursState, setHoursState] = useState<SaveState>("idle")

    // last values the server confirmed, so we only send real changes
    const savedNotes = useRef(shelf.caption ?? "")
    const savedHours = useRef(shelf.playtime ?? 0)
    const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Only the changed field is sent, so a slow request can't overwrite another field with stale data
    const save = async (patch: UpdateShelfInput) => {
        const result = await updateShelf(shelf.id, patch)
        if (!result.ok) toast.error(result.error)
        return result.ok
    }

    const handleStatus = (value: ShelfStatus) => {
        if (value === optimistic.status) return
        startTransition(async () => {
            setOptimistic({ status: value })
            if (await save({ status: value })) toast.success(`Moved to ${STATUS_META[value].label}`)
        })
    }

    const handleRating = (value: number) => {
        startTransition(async () => {
            setOptimistic({ rating: value })
            // 0 means "cleared": store null so it doesn't drag averages down
            await save({ rating: value || null })
        })
    }

    const saveNotes = (value: string) => {
        if (notesTimer.current) clearTimeout(notesTimer.current)
        const next = value.trim()
        if (next === savedNotes.current.trim()) return

        setNotesState("saving")
        startTransition(async () => {
            if (await save({ caption: next || null })) {
                savedNotes.current = next
                setNotesState("saved")
            } else {
                setNotesState("idle")
            }
        })
    }

    const saveHours = () => {
        const value = hours === "" ? 0 : Number(hours)
        if (!Number.isInteger(value) || value < 0) {
            toast.error("Play hours must be a whole number")
            setHours(String(savedHours.current))
            return
        }
        if (value === savedHours.current) return

        setHoursState("saving")
        startTransition(async () => {
            if (await save({ playtime: value })) {
                savedHours.current = value
                setHoursState("saved")
            } else {
                setHoursState("idle")
            }
        })
    }

    // Autosave notes shortly after typing stops
    const onNotesChange = (value: string) => {
        setNotes(value)
        setNotesState("idle")
        if (notesTimer.current) clearTimeout(notesTimer.current)
        notesTimer.current = setTimeout(() => saveNotes(value), AUTOSAVE_MS)
    }

    useEffect(() => () => {
        if (notesTimer.current) clearTimeout(notesTimer.current)
    }, [])

    const formatDate = (date: Date | null) =>
        date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone }) : null
    // filled in automatically as the status changes
    const timeline = [
        { label: "Added", date: formatDate(shelf.createdAt) },
        { label: "Started", date: formatDate(shelf.startedAt) },
        { label: "Finished", date: formatDate(shelf.completedAt) },
    ].filter((step) => step.date)

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
            <Link href="/shelf" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" />
                Back to My Shelf
            </Link>

            {/* Header */}
            <section className="grid items-end gap-8 md:grid-cols-[1.3fr_1fr]">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-line shadow-2xl shadow-black/60">
                    {shelf.backgroundImage ? (
                        <Image
                            src={getCroppedImageUrl(shelf.backgroundImage, 1280)}
                            alt={shelf.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 640px"
                            className="object-cover"
                            preload
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface-2 text-subtle">No Image</div>
                    )}
                </div>

                <div className="space-y-5">
                    <ol className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-subtle" aria-label="Timeline">
                        {timeline.map((step) => (
                            <li key={step.label}>
                                {step.label} <span className="text-muted">{step.date}</span>
                            </li>
                        ))}
                    </ol>
                    <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">{shelf.title}</h1>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your rating</p>
                        <StarRating value={optimistic.rating} onChange={handleRating} disabled={isPending} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {listsSlot}
                        <Link href={`/games/${shelf.slug}`} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                            View game details <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Status: segmented control */}
            <section className="space-y-3">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted" id="status-label">Status</h2>
                <div role="radiogroup" aria-labelledby="status-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {SHELF_STATUSES.map((s) => {
                        const active = s === optimistic.status
                        return (
                            <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => handleStatus(s)}
                                className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border font-display text-sm font-semibold uppercase tracking-wide transition-colors
                                    ${active ? "text-accent-fg" : "border-line-strong bg-surface text-muted hover:border-muted hover:text-fg"}`}
                                style={active ? { background: STATUS_META[s].color, borderColor: STATUS_META[s].color } : undefined}
                            >
                                {!active && <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].color }} />}
                                {STATUS_META[s].label}
                            </button>
                        )
                    })}
                </div>
            </section>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Play hours: saves on blur or Enter */}
                <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <label htmlFor="play-hours" className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Play hours</label>
                        <SaveIndicator state={hoursState} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <input
                            id="play-hours"
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={hours}
                            onChange={(e) => {
                                setHours(e.target.value)
                                setHoursState("idle")
                            }}
                            onBlur={saveHours}
                            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                            className="w-full min-w-0 border-b border-line-strong bg-transparent font-mono text-5xl font-bold text-fg transition-colors focus:border-accent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-muted">hours</span>
                    </div>
                    <p className="mt-3 text-xs text-subtle">Saved when you leave the field or press Enter.</p>
                </Card>

                {/* Notes: autosave */}
                <Card className="p-6 md:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <label htmlFor="notes" className="font-display text-sm font-semibold uppercase tracking-wider text-muted">My notes</label>
                        <SaveIndicator state={notesState} />
                    </div>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        onBlur={() => saveNotes(notes)}
                        maxLength={NOTES_MAX}
                        placeholder="What do you think of it so far? Where did you leave off?"
                        className="h-44 w-full resize-none rounded-md border border-line bg-surface-2 p-3 leading-relaxed text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
                    />
                    <p className="mt-2 text-right font-mono text-xs text-subtle">{notes.length}/{NOTES_MAX}</p>
                </Card>
            </div>
        </div>
    )
}
