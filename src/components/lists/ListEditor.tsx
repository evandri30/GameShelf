"use client"

import { useOptimistic, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Trash2, X } from "lucide-react"
import { toast } from "react-toastify"
import type { ShelfStatus } from "@/generated/prisma/browser"
import { deleteList, toggleListItem, updateList } from "@/app/shelf/actions"
import { getCroppedImageUrl } from "@/utils/image"
import { StatusBadge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

type Game = { id: string; title: string; slug: string; status: ShelfStatus; backgroundImage: string | null }

type Props = {
    list: { id: string; name: string; description: string | null }
    games: Game[]
}

const inputClass = "w-full rounded-md border border-line-strong bg-surface-2 px-3 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"

// Rename / describe / delete the list and remove games from it
export default function ListEditor({ list, games }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(list.name)
    const [description, setDescription] = useState(list.description ?? "")
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [visibleGames, removeGame] = useOptimistic(games, (state, shelfId: string) => state.filter((g) => g.id !== shelfId))

    const save = () => {
        startTransition(async () => {
            const result = await updateList(list.id, { name, description: description || null })
            if (!result.ok) return void toast.error(result.error)
            toast.success("List updated")
            setEditing(false)
        })
    }

    const remove = (game: Game) => {
        startTransition(async () => {
            removeGame(game.id)
            const result = await toggleListItem(list.id, game.id, false)
            if (result.ok) toast.success(`Removed ${game.title}`)
            else toast.error(result.error)
        })
    }

    const destroy = () => {
        setConfirmDelete(false)
        startTransition(async () => {
            const result = await deleteList(list.id)
            if (!result.ok) return void toast.error(result.error)
            toast.success("List deleted")
            router.push("/shelf/lists")
        })
    }

    return (
        <div className="space-y-8">
            {editing ? (
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault()
                        save()
                    }}
                >
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required aria-label="List name" className={`${inputClass} h-12 font-display text-2xl font-bold uppercase`} autoFocus />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} aria-label="Description" placeholder="Description (optional)" className={`${inputClass} h-20 resize-none py-2 text-sm`} />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending || !name.trim()}>{isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
                        <Button variant="ghost" onClick={() => { setEditing(false); setName(list.name); setDescription(list.description ?? "") }}>Cancel</Button>
                    </div>
                </form>
            ) : (
                <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">{list.name}</h1>
                        {list.description && <p className="max-w-2xl text-muted">{list.description}</p>}
                        <p className="font-mono text-sm text-subtle">{visibleGames.length} {visibleGames.length === 1 ? "game" : "games"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
                    </div>
                </header>
            )}

            {visibleGames.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line-strong py-16 text-center text-muted">
                    No games yet. Open a game from <Link href="/shelf" className="text-accent hover:underline">My Shelf</Link> and use &ldquo;Add to list&rdquo;.
                </p>
            ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleGames.map((game) => (
                        <li key={game.id} className="group relative overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-line-strong">
                            <Link href={`/shelf/${game.slug}`} className="block">
                                <div className="relative aspect-video">
                                    {game.backgroundImage && <Image src={getCroppedImageUrl(game.backgroundImage)} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />}
                                    <StatusBadge status={game.status} className="absolute left-3 top-3 bg-base/80" />
                                </div>
                                <p className="line-clamp-1 p-3 font-semibold text-fg group-hover:text-accent">{game.title}</p>
                            </Link>
                            <button
                                type="button"
                                onClick={() => remove(game)}
                                aria-label={`Remove ${game.title} from this list`}
                                className="absolute right-3 top-3 cursor-pointer rounded-full border border-line-strong bg-base/80 p-1.5 text-fg backdrop-blur-md transition-colors hover:border-status-dropped hover:text-status-dropped"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {confirmDelete && (
                <ConfirmDialog
                    open
                    title={`Delete "${list.name}"?`}
                    description="The list is deleted. The games stay on your shelf."
                    confirmLabel="Delete list"
                    onConfirm={destroy}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    )
}
