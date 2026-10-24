import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { POST } from "@/app/api/auth/register/route"
import { makeUser, resetDb } from "../helpers/db"

let ipCounter = 0

// Each test gets its own IP so the 5-per-hour limit only kicks in where a test wants it
function register(body: unknown, ip = `10.0.0.${++ipCounter}`) {
    return POST(new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": ip },
        body: typeof body === "string" ? body : JSON.stringify(body),
    }))
}

const valid = { name: "Evan Ridho", email: "Evan@Test.dev", password: "Secret123" }

beforeEach(async () => {
    await resetDb()
    vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("POST /api/auth/register", () => {
    it("creates the account", async () => {
        const res = await register(valid)
        const body = await res.json()

        expect(res.status).toBe(201)
        const user = await prisma.user.findUniqueOrThrow({ where: { id: body.userId } })
        expect(user.email).toBe("evan@test.dev")
        expect(user.username).toBe("evanridho")
        expect(user.isPublic).toBe(false)
        expect(user.password).not.toBe(valid.password)
        expect(await bcrypt.compare(valid.password, user.password!)).toBe(true)
    })

    it("rejects a body that is not JSON", async () => {
        const res = await register("{not json")
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: "Invalid Input" })
    })

    it("rejects input that fails validation", async () => {
        const res = await register({ ...valid, password: "weak" })
        expect(res.status).toBe(400)
        expect(await prisma.user.count()).toBe(0)
    })

    it("rejects an email that exists with different casing", async () => {
        await makeUser({ email: "evan@test.dev" })
        const res = await register({ ...valid, email: "EVAN@test.DEV" })

        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: "Email already exist" })
    })

    it("turns two simultaneous sign-ups with one email into one account and a 400", async () => {
        const responses = await Promise.all([register(valid), register(valid)])

        expect(responses.map((r) => r.status).sort()).toEqual([201, 400])
        expect(await prisma.user.count()).toBe(1)
    })

    it("gives a second user with the same name a different username", async () => {
        await register(valid)
        const res = await register({ ...valid, email: "other@test.dev" })
        const user = await prisma.user.findUniqueOrThrow({ where: { id: (await res.json()).userId } })

        expect(user.username).toMatch(/^evanridho-\d{4}$/)
    })

    it("allows 5 sign-ups per network per hour", async () => {
        const ip = "203.0.113.50"
        for (let i = 0; i < 5; i++) {
            expect((await register({ ...valid, email: `u${i}@test.dev` }, ip)).status).toBe(201)
        }

        const res = await register({ ...valid, email: "u6@test.dev" }, ip)
        expect(res.status).toBe(429)
        expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0)
        expect(await prisma.user.count()).toBe(5)
    })
})
