import { describe, expect, it } from "vitest"
import { discoverHref } from "@/constants/discover"
import { isShelfStatus } from "@/constants/status"

describe("discoverHref", () => {
    it("returns the bare Discover path without a query", () => {
        expect(discoverHref({})).toBe("/games")
    })

    it("leaves page 1 out of the url", () => {
        expect(discoverHref({ page: 1 })).toBe("/games")
        expect(discoverHref({ page: 3 })).toBe("/games?page=3")
    })

    it("writes search, then filters, then page", () => {
        expect(discoverHref({ page: 2, year: "2020", search: "zelda", genre: "rpg", platform: "7", ordering: "-rating" }))
            .toBe("/games?search=zelda&genre=rpg&platform=7&ordering=-rating&year=2020&page=2")
    })

    it("encodes the search term", () => {
        expect(discoverHref({ search: "f1 25" })).toBe("/games?search=f1+25")
    })

    it("skips empty values", () => {
        expect(discoverHref({ search: "", genre: "" })).toBe("/games")
    })
})

describe("isShelfStatus", () => {
    it.each(["PLANNED", "PLAYING", "COMPLETED", "DROPPED"])("accepts %s", (status) => {
        expect(isShelfStatus(status)).toBe(true)
    })

    it.each(["planned", "", "WISHLIST"])("rejects %j", (status) => {
        expect(isShelfStatus(status)).toBe(false)
    })
})
