import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { prisma } from "@/lib/prisma"
import { rateLimit, resetRateLimit } from "@/lib/rate-limit"
import { generateUniqueUsername } from "@/services/user.service"
import { makeUser, resetDb } from "../helpers/db"

beforeEach(async () => {
    await resetDb()
    // skip the random cleanup of old windows so counts stay predictable
    vi.spyOn(Math, "random").mockReturnValue(0.5)
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe("rateLimit", () => {
    it("allows up to the limit, then blocks", async () => {
        const results = []
        for (let i = 0; i < 4; i++) results.push(await rateLimit("test:key", 3, 60_000))

        expect(results.map((r) => r.ok)).toEqual([true, true, true, false])
        expect(results[3].retryAfterSeconds).toBeGreaterThan(0)
        expect(results[3].retryAfterSeconds).toBeLessThanOrEqual(60)
    })

    it("counts keys separately", async () => {
        await rateLimit("a", 1, 60_000)
        expect((await rateLimit("b", 1, 60_000)).ok).toBe(true)
        expect((await rateLimit("a", 1, 60_000)).ok).toBe(false)
    })

    it("starts a fresh window once the old one ended", async () => {
        await rateLimit("short", 1, 50)
        expect((await rateLimit("short", 1, 50)).ok).toBe(false)

        await new Promise((r) => setTimeout(r, 80))

        expect((await rateLimit("short", 1, 50)).ok).toBe(true)
        expect((await prisma.rateLimit.findUniqueOrThrow({ where: { key: "short" } })).count).toBe(1)
    })

    it("resetRateLimit clears the counter", async () => {
        await rateLimit("login:email:x", 1, 60_000)
        await resetRateLimit("login:email:x")
        expect((await rateLimit("login:email:x", 1, 60_000)).ok).toBe(true)
    })

    it("holds under concurrent hits", async () => {
        const results = await Promise.all(Array.from({ length: 10 }, () => rateLimit("burst", 5, 60_000)))
        expect(results.filter((r) => r.ok)).toHaveLength(5)
    })
})

describe("generateUniqueUsername", () => {
    it("uses the base when it is free", async () => {
        expect(await generateUniqueUsername("Evan Ridho")).toBe("evanridho")
    })

    it("adds a numeric suffix when the base is taken", async () => {
        await makeUser({ username: "evanridho" })
        expect(await generateUniqueUsername("Evan Ridho")).toMatch(/^evanridho-\d{4}$/)
    })
})
