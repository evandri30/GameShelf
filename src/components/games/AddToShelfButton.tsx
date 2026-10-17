"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Check, Loader2, Plus } from 'lucide-react'
import { toast } from "react-toastify"
import type { ShelfStatus } from "@/generated/prisma/browser"
import { SHELF_STATUSES, STATUS_META, isShelfStatus } from "@/constants/status"
import { addToShelf } from "@/app/shelf/actions"
import Button, { buttonClass } from "@/components/ui/Button"

type Props = {
    rawgId: number;
    title: string;
    slug: string;
    backgroundImage: string | null;
    // set when the game is already on the user's shelf
    entry?: { status: ShelfStatus; slug: string };
}

// Add with a chosen status straight from the game page; stays on the page afterwards
export default function AddToShelfButton({ rawgId, title, slug, backgroundImage, entry }: Props) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<ShelfStatus>("PLANNED")
    const [added, setAdded] = useState(entry ?? null)

    const addHandler = () => {
        startTransition(async () => {
            const result = await addToShelf({ rawgId, title, slug, backgroundImage, status })

            if (result.ok) {
                setAdded({ status, slug })
                toast.success(`Added to your shelf as ${STATUS_META[status].label}`)
            } else if (result.error === "Game already in shelf") {
                setAdded({ status, slug })
                toast.info("This game is already in your shelf")
            } else {
                toast.error(result.error)
            }
        })
    }

    if (added) {
        return (
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold text-accent-fg"
                    style={{ background: STATUS_META[added.status].color }}
                >
                    <Check className="h-4 w-4" /> In your shelf · {STATUS_META[added.status].label}
                </span>
                <Link href={`/shelf/${added.slug}`} className={buttonClass("secondary", "md")}>
                    Open in shelf
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="add-status" className="sr-only">Status</label>
            <select
                id="add-status"
                value={status}
                onChange={(e) => isShelfStatus(e.target.value) && setStatus(e.target.value)}
                disabled={isPending}
                className="h-10 cursor-pointer rounded-md border border-line-strong bg-surface-2 px-3 text-sm text-fg focus:border-accent focus:outline-none"
            >
                {SHELF_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
            </select>
            <Button onClick={addHandler} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isPending ? "Adding..." : "Add to shelf"}
            </Button>
        </div>
    )
}
