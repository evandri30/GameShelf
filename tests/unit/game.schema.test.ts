import { describe, expect, it } from "vitest"
import { GameDetailSchema, GameResponseSchema, GameSchema } from "@/schemas/game.schema"

const game = {
    id: 1,
    slug: "portal-2",
    name: "Portal 2",
    background_image: "https://media.rawg.io/media/games/portal.jpg",
    rating: 4.6,
    released: "2011-04-18",
    metacritic: 95,
    esrb_rating: null,
    genres: [{ id: 1, name: "Puzzle" }],
    platforms: [{ platform: { id: 4, slug: "pc", name: "PC" } }],
}

const detail = {
    ...game,
    description: "<p>Portal</p>",
    rating_top: 5,
    playtime: 11,
    genres: [{ id: 1, name: "Puzzle", slug: "puzzle" }],
    developers: [],
    publishers: [],
    tags: [],
    website: "https://www.thinkwithportals.com",
    stores: [{ store: { id: 1, name: "Steam", domain: "store.steampowered.com" } }],
}

describe("GameSchema", () => {
    it("parses a RAWG list item", () => {
        expect(GameSchema.parse(game).name).toBe("Portal 2")
    })

    it("turns null genres and platforms into empty arrays", () => {
        const parsed = GameSchema.parse({ ...game, genres: null, platforms: null })
        expect(parsed.genres).toEqual([])
        expect(parsed.platforms).toEqual([])
    })

    it("allows a missing cover image and release date", () => {
        expect(GameSchema.safeParse({ ...game, background_image: null, released: null }).success).toBe(true)
    })

    it("rejects a rating outside 0-5", () => {
        expect(GameSchema.safeParse({ ...game, rating: 5.1 }).success).toBe(false)
    })
})

describe("GameDetailSchema", () => {
    it("parses a RAWG detail response", () => {
        expect(GameDetailSchema.parse(detail).stores[0].store.name).toBe("Steam")
    })

    it("falls back to null for a website that is not a URL", () => {
        expect(GameDetailSchema.parse({ ...detail, website: "" }).website).toBeNull()
    })

    it("falls back to null for a store with a broken domain", () => {
        const parsed = GameDetailSchema.parse({ ...detail, stores: [{ store: { id: 1, name: "Steam", domain: 42 } }] })
        expect(parsed.stores[0].store.domain).toBeNull()
    })

    it("turns null developers, publishers, tags and stores into empty arrays", () => {
        const parsed = GameDetailSchema.parse({ ...detail, developers: null, publishers: null, tags: null, stores: null })
        expect([parsed.developers, parsed.publishers, parsed.tags, parsed.stores]).toEqual([[], [], [], []])
    })
})

describe("GameResponseSchema", () => {
    it("parses a page of results", () => {
        const parsed = GameResponseSchema.parse({ count: 1, next: null, previous: null, results: [game] })
        expect(parsed.results).toHaveLength(1)
    })
})
