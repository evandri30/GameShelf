'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { ChangePasswordSchema, DeleteAccountSchema, ProfileSettingsSchema } from '@/schemas/profile.schema'
import { changeUserPassword, deleteUserAccount, updateProfileSettings } from '@/services/user.service'
import { rateLimit, resetRateLimit } from '@/lib/rate-limit'
import type { ActionResult } from '@/app/shelf/actions'

export async function updateProfile(input: { username?: string; isPublic?: boolean }): Promise<ActionResult<{ username: string; isPublic: boolean }>> {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = ProfileSettingsSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    try {
        const profile = await updateProfileSettings(userId, result.data)
        revalidatePath('/dashboard', 'layout')
        revalidatePath('/u', 'layout')
        return { ok: true, data: profile }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { ok: false, error: 'That username is taken' }
        }
        console.error(error)
        return { ok: false, error: 'Failed to save' }
    }
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<ActionResult> {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = ChangePasswordSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    // same reason as deleteAccount: don't let a stolen session guess the current password
    const limitKey = `change-password:${userId}`
    const limit = await rateLimit(limitKey, 5, 15 * 60 * 1000)
    if (!limit.ok) return { ok: false, error: 'Too many attempts. Try again later.' }

    try {
        const outcome = await changeUserPassword(userId, result.data.currentPassword, result.data.newPassword)
        if (outcome === 'wrong_password') return { ok: false, error: 'Current password is wrong' }
        if (outcome === 'not_found') return { ok: false, error: 'Account not found' }
    } catch (error) {
        console.error(error)
        return { ok: false, error: 'Failed to change the password' }
    }

    await resetRateLimit(limitKey)
    return { ok: true }
}

export async function deleteAccount(input: { password: string }): Promise<ActionResult> {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = DeleteAccountSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    // the password check would otherwise let a stolen session guess the password
    const limitKey = `delete-account:${userId}`
    const limit = await rateLimit(limitKey, 5, 15 * 60 * 1000)
    if (!limit.ok) return { ok: false, error: 'Too many attempts. Try again later.' }

    try {
        const outcome = await deleteUserAccount(userId, result.data.password)
        if (outcome === 'wrong_password') return { ok: false, error: 'Wrong password' }
        if (outcome === 'not_found') return { ok: false, error: 'Account not found' }
    } catch (error) {
        console.error(error)
        return { ok: false, error: 'Failed to delete the account' }
    }

    await resetRateLimit(limitKey)
    // the public profile and its lists disappear right away
    revalidatePath('/u', 'layout')
    return { ok: true }
}
