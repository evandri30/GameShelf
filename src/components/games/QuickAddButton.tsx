"use client"

import { useState, useTransition } from "react"
import { Check, Loader2, Plus } from "lucide-react"
import { toast } from "react-toastify"
import { addToShelf } from "@/app/shelf/actions"

type Props = {
    rawgId: number
    title: string
    slug: string
    backgroundImage: string | null
}

// One-tap add from a game card; the game lands in the shelf as PLANNED
export default function QuickAddButton({ rawgId, title, slug, backgroundImage }: Props) {
    const [isPending, startTransition] = useTransition()
    const [added, setAdded] = useState(false)

    const onClick = () => {
        if (added) return

        startTransition(async () => {
            const result = await addToShelf({ rawgId, title, slug, backgroundImage })

            if (result.ok) {
                setAdded(true)
                toast.success(`${title} added to your shelf`)
            } else if (result.error === "Game already in shelf") {
                setAdded(true)
                toast.info(`${title} is already in your shelf`)
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isPending}
            aria-label={added ? `${title} is in your shelf` : `Add ${title} to shelf`}
            title={added ? "In your shelf" : "Add to shelf"}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-colors disabled:cursor-wait
                ${added
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-line-strong bg-base/70 text-fg hover:border-accent hover:bg-accent hover:text-accent-fg"}`}
        >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
    )
}
