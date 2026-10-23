import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// 'use cache' is just a string outside Next; its helpers need a Next request to run
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))

vi.stubEnv("RAWG_API_KEY", "test-key")
const { RawgError, getGameBySlug, getGenres, listGames } = await import("@/lib/rawg")

const page = {
    count: 1,
    next: null,
    previous: null,
    results: [{
        id: 1, slug: "portal-2", name: "Portal 2", background_image: null, rating: 4.6, released: null,
        metacritic: null, esrb_rating: null, genres: [], platforms: [],
    }],
}

const detail = {
    ...page.results[0],
    description: '<p>Think <strong>portals</strong></p><script>alert(1)</script><img src=x onerror=alert(1)>',
    rating_top: 5, playtime: 10, developers: [], publishers: [], tags: [], website: null, stores: [],
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
}

const fetchMock = vi.fn<typeof fetch>()

function requestedUrl(call = 0) {
    return new URL(String(fetchMock.mock.calls[call][0]))
}

beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("rawgFetch (through listGames)", () => {
    it("sends the API key and paging params", async () => {
        fetchMock.mockResolvedValueOnce(json(page))
        const data = await listGames({ page: 2 }, 12)

        expect(data.results[0].slug).toBe("portal-2")
        const url = requestedUrl()
        expect(url.pathname).toBe("/api/games")
        expect(url.searchParams.get("key")).toBe("test-key")
        expect(url.searchParams.get("page")).toBe("2")
        expect(url.searchParams.get("page_size")).toBe("12")
    })

    it("retries a 5xx once and returns the second answer", async () => {
        fetchMock.mockResolvedValueOnce(json({}, 503)).mockResolvedValueOnce(json(page))
        await expect(listGames()).resolves.toMatchObject({ count: 1 })
        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it("retries a network error", async () => {
        fetchMock.mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(json(page))
        await expect(listGames()).resolves.toMatchObject({ count: 1 })
    })

    it("gives up after one retry", async () => {
        fetchMock.mockResolvedValue(json({}, 500))
        await expect(listGames()).rejects.toThrow(RawgError)
        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it("does not retry a 4xx", async () => {
        fetchMock.mockResolvedValue(json({}, 401))
        await expect(listGames()).rejects.toMatchObject({ status: 401 })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })
})

describe("listGames", () => {
    it("maps the Discover query onto RAWG params", async () => {
        fetchMock.mockResolvedValueOnce(json(page))
        await listGames({ search: "zelda", genre: "rpg", platform: "7", ordering: "-rating", year: "2017" })

        const params = requestedUrl().searchParams
        expect(params.get("search")).toBe("zelda")
        expect(params.get("genres")).toBe("rpg")
        expect(params.get("parent_platforms")).toBe("7")
        expect(params.get("ordering")).toBe("-rating")
        expect(params.get("dates")).toBe("2017-01-01,2017-12-31")
    })

    it("drops an unknown ordering and a malformed year", async () => {
        fetchMock.mockResolvedValueOnce(json(page))
        await listGames({ ordering: "-hacked", year: "20x7" })

        const params = requestedUrl().searchParams
        expect(params.has("ordering")).toBe(false)
        expect(params.has("dates")).toBe(false)
    })

    it("shows an empty page when RAWG answers 404 for a page past the end", async () => {
        fetchMock.mockResolvedValueOnce(json({ detail: "Invalid page." }, 404))
        await expect(listGames({ page: 999 })).resolves.toEqual({ count: 0, next: null, previous: null, results: [] })
    })

    it("throws when RAWG sends a shape it does not expect", async () => {
        fetchMock.mockResolvedValueOnce(json({ results: "nope" }))
        await expect(listGames()).rejects.toThrow()
    })
})

describe("getGameBySlug", () => {
    it("returns null for an unknown slug", async () => {
        fetchMock.mockResolvedValueOnce(json({ detail: "Not found." }, 404))
        await expect(getGameBySlug("no-such-game")).resolves.toBeNull()
    })

    it("strips unsafe html from the description", async () => {
        fetchMock.mockResolvedValueOnce(json(detail))
        const game = await getGameBySlug("portal-2")

        expect(game?.description).toBe("<p>Think <strong>portals</strong></p>")
    })

    it("url-encodes the slug", async () => {
        fetchMock.mockResolvedValueOnce(json(detail))
        await getGameBySlug("a/b")
        expect(requestedUrl().pathname).toBe("/api/games/a%2Fb")
    })
})

describe("getGenres", () => {
    it("returns value/label options", async () => {
        fetchMock.mockResolvedValueOnce(json({ results: [{ id: 4, slug: "action", name: "Action" }] }))
        await expect(getGenres()).resolves.toEqual([{ value: "action", label: "Action" }])
    })
})
