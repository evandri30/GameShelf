import { prisma } from "@/lib/prisma"

// Counters live in Postgres rather than memory, so limits hold across restarts and multiple instances

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number }

// Counts one attempt for `key` in a fixed window and reports whether it is still within `limit`
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = new Date()
    const resetAt = new Date(now.getTime() + windowMs)

    // one atomic statement: start a fresh window when the old one expired, otherwise count up
    const [row] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
        INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
        ON CONFLICT ("key") DO UPDATE SET
            "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
            "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
        RETURNING "count", "resetAt"`

    // now and then, drop windows that ended a day ago so the table stays small
    if (Math.random() < 0.02) {
        prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(now.getTime() - 86_400_000) } } }).catch(() => {})
    }

    return {
        ok: row.count <= limit,
        retryAfterSeconds: Math.max(1, Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000)),
    }
}

export async function resetRateLimit(key: string) {
    await prisma.rateLimit.deleteMany({ where: { key } })
}

// First hop of X-Forwarded-For as set by the hosting proxy; falls back to a shared bucket
export function clientIp(headers: Headers) {
    return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown"
}
