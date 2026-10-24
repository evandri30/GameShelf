import { describe, expect, it } from "vitest"
import { isValidTimeZone, zonedParts, zonedStartOfMonth } from "@/lib/timezone"

describe("zonedParts", () => {
    it("reads the calendar month in the given zone", () => {
        const instant = new Date("2025-12-31T18:00:00Z")
        expect(zonedParts(instant, "UTC")).toEqual({ year: 2025, month: 11 })
        expect(zonedParts(instant, "Asia/Jakarta")).toEqual({ year: 2026, month: 0 })
        expect(zonedParts(new Date("2026-01-01T03:00:00Z"), "America/New_York")).toEqual({ year: 2025, month: 11 })
    })
})

describe("zonedStartOfMonth", () => {
    it("is local midnight on the 1st", () => {
        expect(zonedStartOfMonth(2026, 0, "Asia/Jakarta").toISOString()).toBe("2025-12-31T17:00:00.000Z")
        expect(zonedStartOfMonth(2026, 0, "UTC").toISOString()).toBe("2026-01-01T00:00:00.000Z")
        expect(zonedStartOfMonth(2026, 6, "America/New_York").toISOString()).toBe("2026-07-01T04:00:00.000Z")
    })

    it("rolls months past either end of the year", () => {
        expect(zonedStartOfMonth(2026, -1, "UTC").toISOString()).toBe("2025-12-01T00:00:00.000Z")
        expect(zonedStartOfMonth(2025, 12, "UTC").toISOString()).toBe("2026-01-01T00:00:00.000Z")
    })
})

describe("isValidTimeZone", () => {
    it("accepts IANA zones and rejects junk", () => {
        expect(isValidTimeZone("Asia/Jakarta")).toBe(true)
        expect(isValidTimeZone("Mars/Olympus")).toBe(false)
    })
})
