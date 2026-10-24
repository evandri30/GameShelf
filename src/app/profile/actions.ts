'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { AVATAR_MAX_BYTES, AVATAR_TYPES, ChangePasswordSchema, DeleteAccountSchema, ProfileSettingsSchema } from '@/schemas/profile.schema'
import { changeUserPassword, deleteUserAccount, removeUserAvatar, setUserAvatar, updateProfileSettings } from '@/services/user.service'
import { rateLimit, resetRateLimit } from '@/lib/rate-limit'
import type { ActionResult } from '@/app/shelf/actions'

export async function updateProfile(input: { name?: string; username?: string; isPublic?: boolean }): Promise<ActionResult<{ name: string | null; username: string; isPublic: boolean }>> {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { ok: false, error: 'Please log in first' }

    const result = ProfileSettingsSchema.safeParse(input)
    if (!result.success) return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input' }

    try {
        const profile = await updateProfileSettings(userId, result.data)
        // the navbar on every page shows the name
        revalidatePath('/', 'layout')
        return { ok: true, data: profile }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { ok: false, error: 'That username is taken' }
        }
        console.error(error)
        return { ok: false, error: 'Failed to save' }
    }
}

// First bytes of each allowed format: the browser-sent type alone is just a claim
function matchesType(bytes: Uint8Array, type: string) {
    const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to))
    if (type === 'image/png') return bytes[0] === 0x89 && ascii(1, 4) === 'PNG'
    if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ image: string }>> {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { ok: false, error: 'Please log in first' }

    const file = formData.get('avatar')
    if (!(file instanceof File) || !(AVATAR_TYPES as readonly string[]).includes(file.type)) {
        return { ok: false, error: 'Pick a PNG, JPG or WebP image' }
    }
    if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: 'That image is too large' }

    const limit = await rateLimit(`avatar:${userId}`, 10, 15 * 60 * 1000)
    if (!limit.ok) return { ok: false, error: 'Too many uploads. Try again later.' }

    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!matchesType(bytes, file.type)) return { ok: false, error: 'Pick a PNG, JPG or WebP image' }

    try {
        const image = await setUserAvatar(userId, bytes, file.type)
        revalidatePath('/', 'layout')
        return { ok: true, data: { image } }
    } catch (error) {
        console.error(error)
        return { ok: false, error: 'Failed to save the photo' }
    }
}

export async function removeAvatar(): Promise<ActionResult> {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { ok: false, error: 'Please log in first' }

    try {
        await removeUserAvatar(userId)
        revalidatePath('/', 'layout')
        return { ok: true }
    } catch (error) {
        console.error(error)
        return { ok: false, error: 'Failed to remove the photo' }
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
