'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { ProfileSettingsSchema } from '@/schemas/profile.schema'
import { updateProfileSettings } from '@/services/user.service'
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
