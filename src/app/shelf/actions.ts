'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { createUserShelf, deleteUserShelf, editUserShelf } from '@/services/shelf.service'
import { CreateShelfSchema, UpdateShelfSchema } from '@/schemas/shelf.schema'
import type { CreateShelfInput, UpdateShelfInput } from '@/types'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function requireUserId() {
    const session = await auth()
    return session?.user?.id ?? null
}

// Shelf data feeds the shelf pages and the dashboard stats
function revalidateShelfViews() {
    revalidatePath('/shelf', 'layout')
    revalidatePath('/dashboard', 'layout')
}

function isPrismaError(error: unknown, code: string) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
}

export async function addToShelf(input: CreateShelfInput): Promise<ActionResult> {
    const userId = await requireUserId()
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = CreateShelfSchema.safeParse(input)
    if (!result.success) return { ok: false, error: 'Invalid input' }

    const { rawgId, title, slug, backgroundImage, status } = result.data

    try {
        await createUserShelf(userId, rawgId, title, slug, backgroundImage, status)
    } catch (error) {
        if (isPrismaError(error, 'P2002')) return { ok: false, error: 'Game already in shelf' }
        console.error(error)
        return { ok: false, error: 'Failed to add game' }
    }

    revalidateShelfViews()
    return { ok: true }
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
