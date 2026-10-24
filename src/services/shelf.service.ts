import { prisma } from '@/lib/prisma'
import type { ShelfStatus } from '@/generated/prisma/browser'
import { cache } from 'react'
import { zonedParts, zonedStartOfMonth } from '@/lib/timezone'

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
            playtime: true,
            updatedAt: true
        }
    })
}

// Everything the user wrote about their games, for the CSV/JSON download
export async function getShelfExport(userId: string) {
    return await prisma.shelf.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
            title: true,
            slug: true,
            rawgId: true,
            status: true,
            rating: true,
            playtime: true,
            caption: true,
            startedAt: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true
        }
    })
}

export type ShelfIndex = Record<number, { id: string; status: ShelfStatus; slug: string }>

// rawgId -> shelf entry, so Discover can show which games are already on the shelf
export const getUserShelfIndex = cache(async (userId: string): Promise<ShelfIndex> => {
    const rows = await prisma.shelf.findMany({
        where: { userId },
        select: { id: true, rawgId: true, status: true, slug: true }
    })
    return Object.fromEntries(rows.map(({ rawgId, ...rest }) => [rawgId, rest]))
})

export const getUserBySlug = cache(async (userId: string, slug: string) => {
    return await prisma.shelf.findUnique({
        where: {
            userId_slug: {
                userId,
                slug
            }
        }
    })
})

async function nextBacklogPosition(userId: string) {
    const { _max } = await prisma.shelf.aggregate({
        where: { userId, status: 'PLANNED' },
        _max: { backlogPosition: true }
    })
    return (_max.backlogPosition ?? 0) + 1
}

type Timeline = {
    startedAt?: Date | null
    completedAt?: Date | null
    backlogPosition?: number | null
}

// Dates and backlog order follow the status, so the user never has to fill them in
async function timelineFor(
    userId: string,
    next: ShelfStatus,
    current?: { status: ShelfStatus; startedAt: Date | null; completedAt: Date | null }
): Promise<Timeline> {
    if (current?.status === next) return {}

    const now = new Date()
    const timeline: Timeline = {
        // only PLANNED games live in the backlog queue
        backlogPosition: next === 'PLANNED' ? await nextBacklogPosition(userId) : null,
    }

    if (next === 'PLAYING') {
        timeline.startedAt = current?.startedAt ?? now
        timeline.completedAt = null
    } else if (next === 'COMPLETED') {
        timeline.startedAt = current?.startedAt ?? now
        timeline.completedAt = now
    } else {
        // PLANNED or DROPPED: not finished (any more)
        timeline.completedAt = null
    }

    return timeline
}

export async function createUserShelf(userId: string, rawgId: number, title: string, slug: string, backgroundImage: string | null, status: ShelfStatus = 'PLANNED') {
    return await prisma.shelf.create({
        data: {
            userId,
            rawgId,
            title,
            slug,
            backgroundImage,
            status,
            ...(await timelineFor(userId, status))
        }
    })
}

export async function editUserShelf(id: string, userId: string, update: { status?: ShelfStatus, rating?: number | null, caption?: string | null, playtime?: number | null }) {
    let timeline: Timeline = {}

    if (update.status) {
        const current = await prisma.shelf.findUniqueOrThrow({
            where: { id, userId },
            select: { status: true, startedAt: true, completedAt: true }
        })
        timeline = await timelineFor(userId, update.status, current)
    }

    return await prisma.shelf.update({
        where: { id, userId },
        data: { ...update, ...timeline }
    })
}

export async function deleteUserShelf(id: string, userId: string) {
    return await prisma.shelf.delete({
        where: { id, userId }
    })
}

// ---- Backlog ----

export async function getBacklog(userId: string) {
    return await prisma.shelf.findMany({
        where: { userId, status: 'PLANNED' },
        orderBy: [{ backlogPosition: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
        select: { id: true, title: true, slug: true, backgroundImage: true, createdAt: true }
    })
}

// ids is the full new order of the user's planned games
export async function reorderUserBacklog(userId: string, ids: string[]) {
    await prisma.$transaction(
        ids.map((id, index) =>
            prisma.shelf.updateMany({
                where: { id, userId, status: 'PLANNED' },
                data: { backlogPosition: index + 1 }
            })
        )
    )
}

// ---- Timeline & Year in Review ----

// Completed games per month for the last `months` months (oldest first), for the Stats chart.
// Months follow the viewer's time zone, so a game finished at 2am on the 1st counts for that month.
export async function getCompletionsByMonth(userId: string, tz = 'UTC', months = 12) {
    const now = zonedParts(new Date(), tz)
    const start = zonedStartOfMonth(now.year, now.month - (months - 1), tz)
    const rows = await prisma.shelf.findMany({
        where: { userId, status: 'COMPLETED', completedAt: { gte: start } },
        select: { completedAt: true }
    })

    const buckets = Array.from({ length: months }, (_, i) => {
        const d = new Date(Date.UTC(now.year, now.month - (months - 1) + i, 1))
        return { month: d.getUTCMonth(), year: d.getUTCFullYear(), count: 0 }
    })
    for (const { completedAt } of rows) {
        const { year, month } = zonedParts(completedAt!, tz)
        const bucket = buckets.find((b) => b.year === year && b.month === month)
        if (bucket) bucket.count++
    }
    return buckets
}

// Years that have at least one completed game, newest first (for the Year in Review switcher)
export async function getReviewYears(userId: string, tz = 'UTC') {
    const rows = await prisma.shelf.findMany({
        where: { userId, status: 'COMPLETED', completedAt: { not: null } },
        select: { completedAt: true }
    })
    return [...new Set(rows.map((r) => zonedParts(r.completedAt!, tz).year))].sort((a, b) => b - a)
}

export async function getYearInReview(userId: string, year: number, tz = 'UTC') {
    const from = zonedStartOfMonth(year, 0, tz)
    const to = zonedStartOfMonth(year + 1, 0, tz)

    const [completed, started, added] = await Promise.all([
        prisma.shelf.findMany({
            where: { userId, status: 'COMPLETED', completedAt: { gte: from, lt: to } },
            orderBy: { completedAt: 'asc' },
            select: { id: true, title: true, slug: true, backgroundImage: true, rating: true, playtime: true, completedAt: true }
        }),
        prisma.shelf.count({ where: { userId, startedAt: { gte: from, lt: to } } }),
        prisma.shelf.count({ where: { userId, createdAt: { gte: from, lt: to } } }),
    ])

    const months = Array.from({ length: 12 }, (_, month) => ({
        month,
        count: completed.filter((g) => zonedParts(g.completedAt!, tz).month === month).length,
    }))
    const rated = completed.filter((g) => g.rating)

    return {
        year,
        completed,
        started,
        added,
        hours: completed.reduce((acc, g) => acc + (g.playtime ?? 0), 0),
        averageRating: rated.length ? rated.reduce((acc, g) => acc + g.rating!, 0) / rated.length : null,
        favorites: [...rated].sort((a, b) => b.rating! - a.rating! || (b.playtime ?? 0) - (a.playtime ?? 0)).slice(0, 3),
        months,
    }
}

// ---- Dashboard ----

// cache(): generateMetadata and the page both ask for the same data in one request
export const getDashboardData = cache(async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true, id: true, username: true, isPublic: true }
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
