"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import { Check, ListPlus, Plus } from "lucide-react"
import { toast } from "react-toastify"
import { toggleListItem } from "@/app/shelf/actions"
import Menu, { MenuDivider, MenuLabel, menuItemClass } from "@/components/ui/Menu"

type Membership = { id: string; name: string; hasGame: boolean }

// Checklist of the user's lists; ticking one adds/removes this shelf game
export default function AddToListMenu({ shelfId, lists }: { shelfId: string; lists: Membership[] }) {
    const [isPending, startTransition] = useTransition()
    const [optimistic, toggle] = useOptimistic(lists, (state, listId: string) =>
        state.map((l) => (l.id === listId ? { ...l, hasGame: !l.hasGame } : l))
    )
    const count = optimistic.filter((l) => l.hasGame).length

    return (
        <Menu
            label="Add to list"
            align="left"
            triggerClassName="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface-2 px-4 text-sm font-medium text-fg transition-colors hover:border-muted"
            trigger={<><ListPlus className="h-4 w-4" /> {count ? `In ${count} ${count === 1 ? "list" : "lists"}` : "Add to list"}</>}
        >
            {() => (
                <>
                    <MenuLabel>Your lists</MenuLabel>
                    {optimistic.length === 0 && <p className="px-4 py-2 text-sm text-muted">No lists yet.</p>}
                    {optimistic.map((list) => (
                        <button
                            key={list.id}
                            type="button"
                            role="menuitemcheckbox"
                            aria-checked={list.hasGame}
                            disabled={isPending}
                            className={menuItemClass}
                            onClick={() =>
                                // menu stays open so several lists can be ticked in a row
                                startTransition(async () => {
                                    toggle(list.id)
                                    const result = await toggleListItem(list.id, shelfId, !list.hasGame)
                                    if (!result.ok) toast.error(result.error)
                                })
                            }
                        >
                            <span className={`flex h-4 w-4 items-center justify-center rounded border ${list.hasGame ? "border-accent bg-accent text-accent-fg" : "border-line-strong"}`}>
                                {list.hasGame && <Check className="h-3 w-3" />}
                            </span>
                            <span className="max-w-56 truncate">{list.name}</span>
                        </button>
                    ))}
                    <MenuDivider />
                    <Link href="/shelf/lists" role="menuitem" className={`${menuItemClass} text-accent`}>
                        <Plus className="h-4 w-4" /> New list
                    </Link>
                </>
            )}
        </Menu>
    )
}
