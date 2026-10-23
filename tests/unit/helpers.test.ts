import { describe, expect, it, vi } from "vitest"

// Importing these modules pulls in @/lib/prisma; keep the unit suite free of a database
vi.mock("@/lib/prisma", () => ({ prisma: {} }))

const { clientIp } = await import("@/lib/rate-limit")
const { usernameBase } = await import("@/services/user.service")

describe("clientIp", () => {
    it("takes the first X-Forwarded-For hop", () => {
        expect(clientIp(new Headers({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" }))).toBe("203.0.113.7")
    })

    it("falls back to X-Real-IP", () => {
        expect(clientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2")
    })

    it("uses a shared bucket when no header is present", () => {
        expect(clientIp(new Headers())).toBe("unknown")
    })
})

describe("usernameBase", () => {
    it("strips spaces and capitals from a name", () => {
        expect(usernameBase("Evan Ridho")).toBe("evanridho")
    })

    it("uses the local part of an email", () => {
        expect(usernameBase("evan.ridho@mail.com")).toBe("evanridho")
    })

    it("keeps at most 14 characters", () => {
        expect(usernameBase("abcdefghijklmnopqrstuvwxyz")).toBe("abcdefghijklmn")
    })

    it("falls back to 'player' when too little is left", () => {
        expect(usernameBase("Jo")).toBe("player")
        expect(usernameBase("李小龍")).toBe("player")
    })
})
