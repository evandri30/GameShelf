import { prisma } from '@/lib/prisma'
import { ShelfStatus } from '@/generated/prisma/browser'
import { cache } from 'react'

export async function getUserShelf(userId: string) {
    return await prisma.shelf.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        // only what the shelf grid renders
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            backgroundImage: true,
            rating: true,
            caption: true,
            playtime: true
        }
    })
}

export const getUserBySlug = cache(async (userId: string, slug: string) => {
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
})

export async function createUserShelf(userId: string, rawgId: number, title: string, slug: string, backgroundImage: string | null, status?: ShelfStatus) {
    return await prisma.shelf.create({
        data: {
            userId,
            rawgId,
            title,
            slug,
            backgroundImage,
            status
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

// cache(): generateMetadata and the page both ask for the same data in one request
export const getDashboardData = cache(async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true, id: true }
    })

    if (!user) return null

    const [stats, topGames, totals, rated] = await Promise.all([
        prisma.shelf.groupBy({
            by: ['status'],
            where: { userId },
            _count: { id: true },
            _sum: { playtime: true }
        }),
        prisma.shelf.findMany({
            where: {
                userId,
                status: { notIn: ['PLANNED', 'DROPPED'] },
            },
            orderBy: [
                // Postgres sorts NULL first on DESC; unrated games belong at the bottom
                { rating: { sort: 'desc', nulls: 'last' } },
                { playtime: { sort: 'desc', nulls: 'last' } },
                { createdAt: 'desc' }
            ],
            take: 5,
            select: { id: true, title: true, slug: true, backgroundImage: true, rating: true, playtime: true, status: true }
        }),
        prisma.shelf.aggregate({
            where: { userId },
            _count: { id: true },
            _sum: { playtime: true }
        }),
        // ratings of 0 are legacy "cleared" values, not real scores
        prisma.shelf.aggregate({
            where: { userId, rating: { gt: 0 } },
            _avg: { rating: true },
            _count: { rating: true }
        })
    ])

    return {
        user,
        stats: stats.reduce((acc, curr) => {
            acc[curr.status] = {
                count: curr._count.id,
                playtime: curr._sum.playtime || 0
            }
            return acc
        }, {} as Partial<Record<ShelfStatus, { count: number; playtime: number }>>),
        totalGames: totals._count.id,
        totalHours: totals._sum.playtime ?? 0,
        averageRating: rated._avg.rating,
        ratedGames: rated._count.rating,
        topGames
    }
})
