"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { toast } from "react-toastify"
import { createList } from "@/app/shelf/actions"
import Button from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

const inputClass = "h-10 w-full rounded-md border border-line-strong bg-surface-2 px-3 text-sm text-fg placeholder:text-subtle focus:border-accent focus:outline-none"

export default function NewListForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    return (
        <Card className="p-5">
            <form
                className="flex flex-col gap-3 md:flex-row md:items-end"
                onSubmit={(e) => {
                    e.preventDefault()
                    startTransition(async () => {
                        const result = await createList({ name, description: description || null })
                        if (!result.ok || !result.data) return void toast.error(result.ok ? "Failed to create list" : result.error)
                        toast.success(`"${name.trim()}" created`)
                        router.push(`/shelf/lists/${result.data.id}`)
                    })
                }}
            >
                <label className="flex-1 space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">New list</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="e.g. Couch co-op" className={inputClass} />
                </label>
                <label className="flex-[2] space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Description <span className="normal-case text-subtle">(optional)</span></span>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} placeholder="What ties these games together?" className={inputClass} />
                </label>
                <Button type="submit" disabled={isPending || !name.trim()}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
                </Button>
            </form>
        </Card>
    )
}
