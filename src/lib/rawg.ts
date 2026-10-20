import type { GameDetailProps, GameResponseProps } from "@/types";
import { GameDetailSchema, GameResponseSchema } from "@/schemas/game.schema"
import { cacheLife, cacheTag } from "next/cache"
import dns from "node:dns"
import sanitizeHtml from "sanitize-html"
import { z } from "zod"
import { GAME_ORDERINGS } from "@/constants/discover"

if (typeof window === 'undefined') {
    dns.setDefaultResultOrder('ipv4first');
}

const BASE_URL = "https://api.rawg.io/api";
const API_KEY = process.env.RAWG_API_KEY;

export class RawgError extends Error {
    constructor(public status: number, path: string) {
        super(`RAWG ${status || "network error"} for ${path}`)
        this.name = "RawgError"
    }
}

const TIMEOUT_MS = 5000
const RETRY_DELAYS_MS = [300, 800]

// RAWG sometimes answers 429/5xx or hangs under load, so retry those and give up on the rest
function isRetryable(status: number) {
    return status === 0 || status === 429 || status >= 500
}

async function rawgFetch(path: string, params: Record<string, string | number> = {}): Promise<unknown> {
    const query = new URLSearchParams({ key: API_KEY ?? "" })
    for (const [k, v] of Object.entries(params)) query.set(k, String(v))

    for (let attempt = 0; ; attempt++) {
        let status = 0
        try {
            const res = await fetch(`${BASE_URL}${path}?${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
            if (res.ok) return await res.json()
            status = res.status
        } catch {
            // network error or timeout, status stays 0
        }

        if (!isRetryable(status) || attempt >= RETRY_DELAYS_MS.length) {
            throw new RawgError(status, path)
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
    }
}

export type GameQuery = {
    page?: number
    search?: string
    genre?: string      // RAWG genre slug
    platform?: string   // RAWG parent platform id
    ordering?: string   // one of GAME_ORDERINGS
    year?: string
}

export async function listGames(query: GameQuery = {}, pageSize: number = 20): Promise<GameResponseProps> {
    'use cache'
    cacheLife('hours')
    cacheTag('rawg-games')

    const params: Record<string, string | number> = { page: query.page ?? 1, page_size: pageSize }
    if (query.search) params.search = query.search
    if (query.genre) params.genres = query.genre
    if (query.platform) params.parent_platforms = query.platform
    if (query.ordering && GAME_ORDERINGS.some((o) => o.value === query.ordering)) params.ordering = query.ordering
    if (query.year && /^\d{4}$/.test(query.year)) params.dates = `${query.year}-01-01,${query.year}-12-31`

    // RAWG answers 404 for a page past the end (a hand-edited URL or a stale last-page link): show an empty page
    const data = await rawgFetch('/games', params).catch((err) => {
        if (err instanceof RawgError && err.status === 404) return { count: 0, next: null, previous: null, results: [] }
        throw err
    })
    return GameResponseSchema.parse(data)
}

const NamedItemsSchema = z.object({ results: z.array(z.object({ id: z.number(), slug: z.string(), name: z.string() })) })

export async function getGenres() {
    'use cache'
    cacheLife('weeks')

    const data = NamedItemsSchema.parse(await rawgFetch('/genres', { page_size: 40 }))
    return data.results.map(({ slug, name }) => ({ value: slug, label: name }))
}

// Families like "PlayStation" or "PC" rather than every console generation
export async function getParentPlatforms() {
    'use cache'
    cacheLife('weeks')

    const data = NamedItemsSchema.parse(await rawgFetch('/platforms/lists/parents'))
    return data.results.map(({ id, name }) => ({ value: String(id), label: name }))
}

// null when RAWG has no game with this slug; other failures throw
export async function getGameBySlug(slug: string): Promise<GameDetailProps | null> {
    'use cache'
    cacheLife('days')
    cacheTag('rawg-games', `rawg-game-${slug}`)

    // Errors lose their class crossing the cache boundary, so resolve the 404 in here
    const data = await rawgFetch(`/games/${encodeURIComponent(slug)}`).catch((err) => {
        if (err instanceof RawgError && err.status === 404) return null
        throw err
    })
    if (data === null) return null
    const game = GameDetailSchema.parse(data)

    // description is rendered with dangerouslySetInnerHTML, so strip anything unsafe
    return {
        ...game,
        description: sanitizeHtml(game.description, {
            allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "h3", "h4", "h5", "h6", "a"],
            allowedAttributes: { a: ["href", "target", "rel"] },
            allowedSchemes: ["http", "https"],
        })
    }
}

// ---- Extra detail-page data (each section streams in on its own) ----

const ScreenshotsSchema = z.object({
    results: z.array(z.object({ id: z.number(), image: z.url(), width: z.number(), height: z.number() }))
})

export async function getGameScreenshots(gameId: number) {
    'use cache'
    cacheLife('days')

    return ScreenshotsSchema.parse(await rawgFetch(`/games/${gameId}/screenshots`, { page_size: 12 })).results
}

const StoreLinksSchema = z.object({
    results: z.array(z.object({ store_id: z.number(), url: z.string() }))
})

// The detail endpoint names the stores but leaves their URLs empty; /stores has the URLs
export async function getGameStoreLinks(gameId: number, stores: GameDetailProps["stores"]) {
    'use cache'
    cacheLife('days')

    const links = StoreLinksSchema.parse(await rawgFetch(`/games/${gameId}/stores`)).results
    return stores
        .map(({ store }) => ({ ...store, url: links.find((l) => l.store_id === store.id)?.url ?? "" }))
        .filter((store) => /^https?:\/\//.test(store.url))
}

export async function getGameSeries(gameId: number) {
    'use cache'
    cacheLife('days')

    return GameResponseSchema.parse(await rawgFetch(`/games/${gameId}/game-series`, { page_size: 6 })).results
}
