import { prisma } from '@/lib/prisma'
import { ShelfStatus } from '@prisma/client'

export async function getUserShelf(userId: string) {
    return await prisma.shelf.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    })
}

export async function getUserBySlug(userId: string, slug: string) {
    return await prisma.shelf.findUnique({
        where: {
            userId_slug: {
                userId,
                slug
            }
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true
                }
            }
        }
    })
}

export async function createUserShelf(userId: string, rawgId: number, title: string, slug: string, backgroundImage: string | null) {
    return await prisma.shelf.create({
        data: {
            userId,
            rawgId,
            title,
            slug,
            backgroundImage
        }
    })
}

export async function editUserShelf(id: string, userId: string, update: { status?: ShelfStatus, rating?: number | null, caption?: string | null, playtime?: number | null }) {
    return await prisma.shelf.update({
        where: { id, userId },
        data: update
    })
}

export async function deleteUserShelf(id: string, userId: string) {
    return await prisma.shelf.delete({
        where: { id, userId }
    })
}

export async function getDashboardData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true, id: true }
    })

    if (!user) return null

    const stats = await prisma.shelf.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
            id: true
        }
    })

    const topGames = await prisma.shelf.findMany({
        where: {
            userId,
            status: {
                notIn: ['PLANNED', 'DROPPED']
            },
        },
        orderBy: [
            { rating: 'desc' },
            { playtime: 'desc' },
            { createdAt: 'desc' }
        ],
        take: 5
    })

    const totalGames = await prisma.shelf.count({
        where: { userId }
    })

    return {
        user,
        stats: stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id
            return acc
        }, {} as Record<ShelfStatus, number>),
        totalGames,
        topGames
    }
}