'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { createUserShelf, deleteUserShelf, editUserShelf, reorderUserBacklog } from '@/services/shelf.service'
import { createUserList, deleteUserList, setListMembership, updateUserList } from '@/services/list.service'
import { CreateShelfSchema, UpdateShelfSchema } from '@/schemas/shelf.schema'
import { BacklogOrderSchema, ListSchema } from '@/schemas/profile.schema'
import type { CreateShelfInput, UpdateShelfInput } from '@/types'

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

async function requireUserId() {
    const session = await auth()
    return session?.user?.id ?? null
}

// Shelf data feeds the shelf pages, Discover's "in shelf" badges, the stats and the public profile
function revalidateShelfViews() {
    revalidatePath('/shelf', 'layout')
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/games', 'layout')
    revalidatePath('/u', 'layout')
}

function isPrismaError(error: unknown, code: string) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
}

export async function addToShelf(input: CreateShelfInput): Promise<ActionResult<{ id: string }>> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = CreateShelfSchema.safeParse(input)
    if (!result.success) return { ok: false, error: 'Invalid input' }

    const { rawgId, title, slug, backgroundImage, status } = result.data

    let id: string
    try {
        ({ id } = await createUserShelf(userId, rawgId, title, slug, backgroundImage, status))
    } catch (error) {
        if (isPrismaError(error, 'P2002')) return { ok: false, error: 'Game already in shelf' }
        console.error(error)
        return { ok: false, error: 'Failed to add game' }
    }

    revalidateShelfViews()
    return { ok: true, data: { id } }
}

export async function updateShelf(id: string, input: UpdateShelfInput): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = UpdateShelfSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    try {
        await editUserShelf(id, userId, result.data)
    } catch (error) {
        // P2025: no shelf with this id belonging to the user
        if (isPrismaError(error, 'P2025')) return { ok: false, error: 'Game not found in your shelf' }
        console.error(error)
        return { ok: false, error: 'Failed to update' }
    }

    revalidateShelfViews()
    return { ok: true }
}

export async function removeFromShelf(id: string): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    try {
        await deleteUserShelf(id, userId)
    } catch (error) {
        if (isPrismaError(error, 'P2025')) return { ok: false, error: 'Game not found in your shelf' }
        console.error(error)
        return { ok: false, error: 'Failed to remove game' }
    }

    revalidateShelfViews()
    return { ok: true }
}

export async function reorderBacklog(ids: string[]): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = BacklogOrderSchema.safeParse(ids)
    if (!result.success) return { ok: false, error: 'Invalid order' }

    try {
        await reorderUserBacklog(userId, result.data)
    } catch (error) {
        console.error(error)
        return { ok: false, error: 'Failed to save the new order' }
    }

    revalidatePath('/shelf', 'layout')
    return { ok: true }
}

// ---- Lists ----

export async function createList(input: { name: string; description?: string | null }): Promise<ActionResult<{ id: string }>> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = ListSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    const { id } = await createUserList(userId, result.data.name, result.data.description || null)
    revalidateShelfViews()
    return { ok: true, data: { id } }
}

export async function updateList(listId: string, input: { name: string; description?: string | null }): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = ListSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    try {
        await updateUserList(userId, listId, { name: result.data.name, description: result.data.description || null })
    } catch (error) {
        if (isPrismaError(error, 'P2025')) return { ok: false, error: 'List not found' }
        throw error
    }

    revalidateShelfViews()
    return { ok: true }
}

export async function deleteList(listId: string): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    try {
        await deleteUserList(userId, listId)
    } catch (error) {
        if (isPrismaError(error, 'P2025')) return { ok: false, error: 'List not found' }
        throw error
    }

    revalidateShelfViews()
    return { ok: true }
}

export async function toggleListItem(listId: string, shelfId: string, member: boolean): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    if (!(await setListMembership(userId, listId, shelfId, member))) return { ok: false, error: 'List or game not found' }

    revalidateShelfViews()
    return { ok: true }
}
