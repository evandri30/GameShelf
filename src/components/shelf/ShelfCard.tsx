"use client"

import { useOptimistic, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-toastify"
import { Trash2 } from "lucide-react"
import type { ShelfStatus } from "@/generated/prisma/browser"
import { SHELF_STATUSES, STATUS_META, isShelfStatus } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"
import { removeFromShelf, updateShelf } from "@/app/shelf/actions"
import { StatusBadge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

type Props = {
    id: string;
    title: string;
    slug: string;
    status: ShelfStatus;
    backgroundImage: string | null
}

export default function ShelfCard({ id, title, slug, status, backgroundImage }: Props) {
    const [isPending, startTransition] = useTransition()
    // Optimistic values show the change instantly and fall back to the server value if the action fails
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(status)
    const [removed, setRemoved] = useOptimistic(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const handleChange = (value: string) => {
        if (!isShelfStatus(value)) return

        startTransition(async () => {
            setOptimisticStatus(value)
            const result = await updateShelf(id, { status: value })

            if (result.ok) toast.success("Status updated")
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
        <div className="group overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-line-strong">
            {/* Image */}
            <Link href={`/shelf/${slug}`} className="relative block h-48 w-full overflow-hidden">
                {backgroundImage ? (
                    <Image
                        src={getCroppedImageUrl(backgroundImage)}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2 text-subtle">
                        No Image
                    </div>
                )}
                <StatusBadge status={optimisticStatus} className="absolute left-3 top-3 bg-base/80" />
            </Link>

            {/* Content */}
            <div className="space-y-3 p-4 text-left">
                <Link href={`/shelf/${slug}`}>
                    <h2 className="line-clamp-2 min-h-12 font-semibold text-fg transition-colors hover:text-accent">
                        {title}
                    </h2>
                </Link>

                <div className="flex gap-2">
                    <select
                        aria-label={`Status for ${title}`}
                        className="h-9 min-w-0 flex-1 cursor-pointer rounded-md border border-line-strong bg-surface-2 px-2 text-sm text-fg transition-colors focus:border-accent focus:outline-none"
                        value={optimisticStatus}
                        disabled={isPending}
                        onChange={(e) => handleChange(e.target.value)}
                    >
                        {SHELF_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {STATUS_META[s].label}
                            </option>
                        ))}
                    </select>
                    <Button
                        variant="danger"
                        size="sm"
                        className="h-9 w-9 px-0"
                        onClick={() => setConfirmOpen(true)}
                        disabled={isPending}
                        aria-label={`Remove ${title} from shelf`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Remove this game from your shelf?"
                description={`${title} and your notes, rating and play hours for it will be deleted.`}
                confirmLabel="Yes, remove"
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    )
}
