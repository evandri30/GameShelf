"use client"

import { useOptimistic, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "react-toastify"
import type { ShelfFDetailProps, UpdateShelfInput } from "@/types"
import { SHELF_STATUSES, STATUS_META, isShelfStatus } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"
import { updateShelf } from "@/app/shelf/actions"
import { StatusBadge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import StarRating from "@/components/ui/StarRating"

type Props = {
    shelf: ShelfFDetailProps
}

const inputClass = "w-full rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-fg transition-colors focus:border-accent focus:outline-none"

export default function ShelfDetail({ shelf }: Props) {
    const [isPending, startTransition] = useTransition()

    // status & rating update instantly and roll back on failure
    const [optimistic, setOptimistic] = useOptimistic(
        { status: shelf.status, rating: shelf.rating ?? 0 },
        (state, patch: Partial<{ status: typeof shelf.status; rating: number }>) => ({ ...state, ...patch })
    )

    const [caption, setCaption] = useState(shelf.caption || "")
    const [playHour, setPlayHour] = useState<string>(String(shelf.playtime ?? 0))
    const [isEditingCaption, setIsEditingCaption] = useState(false)
    const [isEditingPlayHour, setIsEditingPlayHour] = useState(false)

    // Only the changed field is sent, so a slow request can't overwrite another field with stale data
    const save = (patch: UpdateShelfInput, successMessage: string, onSuccess?: () => void) => {
        startTransition(async () => {
            if (patch.status) setOptimistic({ status: patch.status })
            if (patch.rating !== undefined) setOptimistic({ rating: patch.rating ?? 0 })

            const result = await updateShelf(shelf.id, patch)

            if (!result.ok) {
                toast.error(result.error)
                return
            }

            toast.success(successMessage)
            onSuccess?.()
        })
    }

    const handleUpdateStatus = (value: string) => {
        if (isShelfStatus(value)) save({ status: value }, "Status updated")
    }

    const handleRating = (value: number) => save({ rating: value }, value ? "Rating updated" : "Rating cleared")

    const handleSaveCaption = () => save({ caption: caption.trim() || null }, "Notes saved", () => setIsEditingCaption(false))

    const handleSavePlayHour = () => {
        const hours = playHour === "" ? 0 : Number(playHour)
        if (!Number.isInteger(hours) || hours < 0) {
            toast.error("Play hours must be a whole number")
            return
        }
        save({ playtime: hours }, "Play hours saved", () => setIsEditingPlayHour(false))
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            {/* Back Button */}
            <Link href="/shelf" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" />
                Back to Shelf
            </Link>

            {/* Header Section */}
            <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg border border-line">
                {shelf.backgroundImage ? (
                    <Image
                        src={getCroppedImageUrl(shelf.backgroundImage, 1280)}
                        alt={shelf.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        className="object-cover"
                        preload
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-subtle">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-base/90 via-base/30 to-transparent" />
            </div>

            <div className="mb-8">
                <h1 className="mb-4 font-display text-4xl font-bold text-fg">{shelf.title}</h1>

                <div className="flex flex-wrap items-center gap-4">
                    <StatusBadge status={optimistic.status} className="px-3 py-1 text-sm" />
                    <StarRating value={optimistic.rating} onChange={handleRating} disabled={isPending} />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column - Status & Play Hours */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <label htmlFor="shelf-status" className="mb-4 block font-display text-lg font-semibold text-fg">Update Status</label>
                        <select
                            id="shelf-status"
                            className={`${inputClass} cursor-pointer`}
                            value={optimistic.status}
                            disabled={isPending}
                            onChange={(e) => handleUpdateStatus(e.target.value)}
                        >
                            {SHELF_STATUSES.map((s) => (
                                <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                        </select>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 font-display text-lg font-semibold text-fg">Play Hours</h3>

                        {isEditingPlayHour ? (
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    value={playHour}
                                    onChange={(e) => setPlayHour(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSavePlayHour()}
                                    className={inputClass}
                                    placeholder="Enter hours played"
                                    aria-label="Hours played"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleSavePlayHour} disabled={isPending} className="flex-1">Save</Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => {
                                            setIsEditingPlayHour(false)
                                            setPlayHour(String(shelf.playtime ?? 0))
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-2 font-mono text-3xl font-bold text-fg">
                                    {shelf.playtime ?? 0} <span className="font-sans text-lg text-muted">hours</span>
                                </p>
                                <button onClick={() => setIsEditingPlayHour(true)} className="cursor-pointer text-sm text-muted transition-colors hover:text-accent">
                                    Edit →
                                </button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Caption */}
                <div className="md:col-span-2">
                    <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-display text-lg font-semibold text-fg">My Notes</h3>
                            {!isEditingCaption && (
                                <button onClick={() => setIsEditingCaption(true)} className="cursor-pointer text-sm text-muted transition-colors hover:text-accent">
                                    Edit →
                                </button>
                            )}
                        </div>

                        {isEditingCaption ? (
                            <div className="space-y-3">
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className={`${inputClass} h-40 resize-none`}
                                    placeholder="Write your thoughts about this game..."
                                    aria-label="Notes"
                                    maxLength={1000}
                                    autoFocus
                                />
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-subtle">{caption.length}/1000</span>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSaveCaption} disabled={isPending}>Save</Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsEditingCaption(false)
                                                setCaption(shelf.caption || "")
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap text-fg/85">
                                {shelf.caption || <span className="text-muted">No notes yet. Click Edit to add your thoughts about this game.</span>}
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
