"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Check, Loader2, Plus } from "lucide-react"
import { toast } from "react-toastify"
import type { ShelfStatus } from "@/generated/prisma/browser"
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import { addToShelf, updateShelf } from "@/app/shelf/actions"
import Menu, { MenuDivider, MenuLabel, menuItemClass } from "@/components/ui/Menu"

export type ShelfEntry = { id: string; status: ShelfStatus; slug: string }

type Props = {
    rawgId: number
    title: string
    slug: string
    backgroundImage: string | null
    entry?: ShelfEntry
}

// Card action: add with a status, or move a game that's already on the shelf
export default function QuickAddButton({ rawgId, title, slug, backgroundImage, entry: initialEntry }: Props) {
    const [isPending, startTransition] = useTransition()
    const [entry, setEntry] = useState(initialEntry)

    const choose = (status: ShelfStatus) => {
        if (entry?.status === status) return

        startTransition(async () => {
            if (entry) {
                const result = await updateShelf(entry.id, { status })
                if (!result.ok) return void toast.error(result.error)
                setEntry({ ...entry, status })
                toast.success(`${title} moved to ${STATUS_META[status].label}`)
                return
            }

            const result = await addToShelf({ rawgId, title, slug, backgroundImage, status })
            if (result.ok && result.data) {
                setEntry({ id: result.data.id, status, slug })
                toast.success(`${title} added as ${STATUS_META[status].label}`)
            } else if (!result.ok) {
                toast.error(result.error)
            }
        })
    }

    const trigger = isPending
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : entry
            ? <span className="flex items-center gap-1.5 px-1 text-xs font-semibold"><Check className="h-3.5 w-3.5" />{STATUS_META[entry.status].label}</span>
            : <Plus className="h-4 w-4" />

    return (
        <Menu
            label={entry ? `${title}: ${STATUS_META[entry.status].label}. Change status` : `Add ${title} to shelf`}
            trigger={trigger}
            triggerClassName={`flex h-9 min-w-9 items-center justify-center rounded-full border px-2 backdrop-blur-md transition-colors
                ${entry
                    ? "border-transparent text-accent-fg"
                    : "border-line-strong bg-base/70 text-fg hover:border-accent hover:bg-accent hover:text-accent-fg"}`}
            triggerStyle={entry ? { background: STATUS_META[entry.status].color } : undefined}
        >
            {(close) => (
                <>
                    <MenuLabel>{entry ? "Move to" : "Add as"}</MenuLabel>
                    {SHELF_STATUSES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            role="menuitemradio"
                            aria-checked={entry?.status === s}
                            disabled={isPending}
                            className={menuItemClass}
                            onClick={() => {
                                close()
                                choose(s)
                            }}
                        >
                            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].color }} />
                            {STATUS_META[s].label}
                            {entry?.status === s && <Check className="ml-auto h-4 w-4 text-accent" />}
                        </button>
                    ))}
                    {entry && (
                        <>
                            <MenuDivider />
                            <Link href={`/shelf/${entry.slug}`} role="menuitem" className={menuItemClass} onClick={close}>
                                Open in shelf
                            </Link>
                        </>
                    )}
                </>
            )}
        </Menu>
    )
}
