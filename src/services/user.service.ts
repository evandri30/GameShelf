import { cache } from 'react'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export { USERNAME_PATTERN } from '@/schemas/profile.schema'

// "Evan Ridho" / "evan.ridho@mail.com" -> "evanridho"
export function usernameBase(source: string) {
    const base = source.toLowerCase().split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 14)
    return base.length >= 3 ? base : 'player'
}

// Picks "<base>" if free, otherwise "<base>-1234" with a random suffix
export async function generateUniqueUsername(source: string) {
    const base = usernameBase(source)
    if (!(await prisma.user.findUnique({ where: { username: base }, select: { id: true } }))) return base

    for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = `${base}-${Math.floor(1000 + Math.random() * 9000)}`
        if (!(await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } }))) return candidate
    }
    return `${base}-${Date.now().toString(36)}`
}

export async function getProfileSettings(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, isPublic: true, name: true, email: true, image: true }
    })
}

// Navbar avatar and name come from the database: the JWT's copy goes stale after a profile edit
export const getNavUser = cache(async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true }
    })
})

export async function updateProfileSettings(userId: string, data: { name?: string; username?: string; isPublic?: boolean }) {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: { name: true, username: true, isPublic: true }
    })
}

// The ?v= part changes with every upload, so the avatar URL can be cached forever
export async function setUserAvatar(userId: string, data: Uint8Array<ArrayBuffer>, mimeType: string) {
    return prisma.$transaction(async (tx) => {
        const avatar = await tx.userAvatar.upsert({
            where: { userId },
            create: { userId, data, mimeType },
            update: { data, mimeType },
            select: { updatedAt: true }
        })
        const image = `/api/avatar/${userId}?v=${avatar.updatedAt.getTime()}`
        await tx.user.update({ where: { id: userId }, data: { image } })
        return image
    })
}

export async function removeUserAvatar(userId: string) {
    await prisma.$transaction([
        prisma.userAvatar.deleteMany({ where: { userId } }),
        prisma.user.update({ where: { id: userId }, data: { image: null } }),
    ])
}

export async function getAvatar(userId: string) {
    return prisma.userAvatar.findUnique({
        where: { userId },
        select: { data: true, mimeType: true, user: { select: { isPublic: true } } }
    })
}

export async function changeUserPassword(userId: string, current: string, next: string): Promise<'changed' | 'wrong_password' | 'not_found'> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
    if (!user) return 'not_found'
    if (!user.password || !(await bcrypt.compare(current, user.password))) return 'wrong_password'

    await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(next, 10) } })
    return 'changed'
}

// Shelf entries, lists and list items go with the user through onDelete: Cascade
export async function deleteUserAccount(userId: string, password: string): Promise<'deleted' | 'wrong_password' | 'not_found'> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
    if (!user) return 'not_found'
    if (!user.password || !(await bcrypt.compare(password, user.password))) return 'wrong_password'

    await prisma.user.delete({ where: { id: userId } })
    return 'deleted'
}

// Everything the public profile page needs; notes (caption) are private and never selected
export const getPublicProfile = cache(async (username: string) => {
    return prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            image: true,
            username: true,
            isPublic: true,
            createdAt: true,
            shelves: {
                orderBy: { updatedAt: 'desc' },
                select: { id: true, title: true, slug: true, status: true, backgroundImage: true, rating: true, playtime: true }
            },
            lists: {
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    _count: { select: { items: true } },
                    items: { take: 4, orderBy: { addedAt: 'desc' }, select: { shelf: { select: { backgroundImage: true } } } }
                }
            }
        }
    })
})
