"use client"

import { useOptimistic, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-toastify"
import { Check, Clock, MoreVertical, Star, Trash2 } from "lucide-react"
import type { ShelfStatus } from "@/generated/prisma/browser"
import type { ShelfProps } from "@/types"
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"
import { removeFromShelf, updateShelf } from "@/app/shelf/actions"
import { StatusBadge } from "@/components/ui/Badge"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Menu, { MenuDivider, MenuLabel, menuItemClass } from "@/components/ui/Menu"

export default function ShelfCard({ id, title, slug, status, backgroundImage, rating, playtime, eager = false }: ShelfProps & { eager?: boolean }) {
    const [isPending, startTransition] = useTransition()
    // Optimistic values show the change instantly and fall back to the server value if the action fails
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(status)
    const [removed, setRemoved] = useOptimistic(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const handleChange = (value: ShelfStatus) => {
        if (value === optimisticStatus) return

        startTransition(async () => {
            setOptimisticStatus(value)
            const result = await updateShelf(id, { status: value })

            if (result.ok) toast.success(`Moved to ${STATUS_META[value].label}`)
            else toast.error(result.error)
        })
    }

    const handleDelete = () => {
        setConfirmOpen(false)

        startTransition(async () => {
            setRemoved(true)
            const result = await removeFromShelf(id)

            if (result.ok) toast.success("Game removed from shelf")
            else toast.error(result.error)
        })
    }

    if (removed) return null

    return (
        <article className="group relative rounded-lg border border-line bg-surface text-left transition-[border-color,box-shadow] hover:border-accent/50 hover:shadow-glow">
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                {backgroundImage ? (
                    <Image
                        src={getCroppedImageUrl(backgroundImage)}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        loading={eager ? "eager" : "lazy"}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-subtle">No Image</div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
                <StatusBadge status={optimisticStatus} className="absolute left-3 top-3 bg-base/80" />
            </div>

            <div className="space-y-2 p-4">
                <h2 className="line-clamp-1 font-semibold text-fg transition-colors group-hover:text-accent">
                    <Link href={`/shelf/${slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {title}
                    </Link>
                </h2>
                <div className="flex items-center gap-4 font-mono text-xs text-muted">
                    <span className="flex items-center gap-1">
                        <Star className={`h-3.5 w-3.5 ${rating ? "fill-accent text-accent" : "text-subtle"}`} aria-hidden />
                        {rating ? `${rating}/5` : "Unrated"}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {playtime ?? 0}h
                    </span>
                </div>
            </div>

            {/* Actions sit above the stretched link */}
            <div className="absolute right-3 top-3 z-10 focus-within:z-30">
                <Menu
                    label={`Actions for ${title}`}
                    triggerClassName="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-base/80 text-fg backdrop-blur-md transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                    trigger={<MoreVertical className="h-4 w-4" />}
                >
                    {(close) => (
                        <>
                            <MenuLabel>Move to</MenuLabel>
                            {SHELF_STATUSES.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={s === optimisticStatus}
                                    disabled={isPending}
                                    className={menuItemClass}
                                    onClick={() => {
                                        close()
                                        handleChange(s)
                                    }}
                                >
                                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].color }} />
                                    {STATUS_META[s].label}
                                    {s === optimisticStatus && <Check className="ml-auto h-4 w-4 text-accent" />}
                                </button>
                            ))}
                            <MenuDivider />
                            <button
                                type="button"
                                role="menuitem"
                                disabled={isPending}
                                className={`${menuItemClass} text-status-dropped`}
                                onClick={() => {
                                    close()
                                    setConfirmOpen(true)
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> Remove from shelf
                            </button>
                        </>
                    )}
                </Menu>
            </div>

            {confirmOpen && (
                <ConfirmDialog
                    open
                    title="Remove this game from your shelf?"
                    description={`${title} and your notes, rating and play hours for it will be deleted.`}
                    confirmLabel="Yes, remove"
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}

            {/* keyboard focus ring for the stretched link */}
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-accent group-has-[a:focus-visible]:ring-2" />
        </article>
    )
}
