import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { ShelfStatus } from "@/generated/prisma/client"

export async function resetDb() {
    await prisma.$executeRawUnsafe(`TRUNCATE "ShelfListItem", "ShelfList", "Shelf", "User", "RateLimit" CASCADE`)
}

let seq = 0

export async function makeUser(overrides: { email?: string; password?: string; name?: string; username?: string; isPublic?: boolean } = {}) {
    const n = ++seq
    return prisma.user.create({
        data: {
            email: overrides.email ?? `user${n}@test.dev`,
            password: await bcrypt.hash(overrides.password ?? "Secret123", 4),
            name: overrides.name ?? `User ${n}`,
            username: overrides.username ?? `user${n}`,
            isPublic: overrides.isPublic ?? false,
        },
    })
}

type ShelfOverrides = {
    rawgId?: number
    title?: string
    slug?: string
    status?: ShelfStatus
    rating?: number | null
    playtime?: number | null
    startedAt?: Date | null
    completedAt?: Date | null
    backlogPosition?: number | null
    createdAt?: Date
}

// Inserts a row as-is, skipping the service's timeline rules, for setting up read-side tests
export async function makeShelf(userId: string, overrides: ShelfOverrides = {}) {
    const n = ++seq
    return prisma.shelf.create({
        data: {
            userId,
            rawgId: overrides.rawgId ?? 1000 + n,
            title: overrides.title ?? `Game ${n}`,
            slug: overrides.slug ?? `game-${n}`,
            backgroundImage: null,
            status: overrides.status ?? "PLANNED",
            rating: overrides.rating ?? null,
            playtime: overrides.playtime ?? null,
            startedAt: overrides.startedAt ?? null,
            completedAt: overrides.completedAt ?? null,
            backlogPosition: overrides.backlogPosition ?? null,
            ...(overrides.createdAt && { createdAt: overrides.createdAt }),
        },
    })
}
