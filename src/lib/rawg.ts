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

async function rawgFetch(path: string, params: Record<string, string | number> = {}): Promise<unknown> {
    const query = new URLSearchParams({ key: API_KEY ?? "" })
    for (const [k, v] of Object.entries(params)) query.set(k, String(v))

    const res = await fetch(`${BASE_URL}${path}?${query}`)

    if (!res.ok) {
        throw new Error("Failed to fetch Game")
    }

    return res.json()
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

    const data = await rawgFetch('/games', params)
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

export async function getGameBySlug(slug: string): Promise<GameDetailProps> {
    'use cache'
    cacheLife('days')
    cacheTag('rawg-games', `rawg-game-${slug}`)

    const data = await rawgFetch(`/games/${encodeURIComponent(slug)}`)
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
