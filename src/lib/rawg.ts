import type { GameDetailProps, GameResponseProps } from "@/types";
import { GameDetailSchema, GameResponseSchema } from "@/schemas/game.schema"
import { cacheLife, cacheTag } from "next/cache"
import dns from "node:dns"
import sanitizeHtml from "sanitize-html"

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

export async function getGames(page: number = 1, pageSize: number = 20): Promise<GameResponseProps> {
    'use cache'
    cacheLife('hours')
    cacheTag('rawg-games')

    const data = await rawgFetch('/games', { page, page_size: pageSize })
    return GameResponseSchema.parse(data)
}

export async function searchGames(query: string, page: number = 1, pageSize: number = 20): Promise<GameResponseProps> {
    'use cache'
    cacheLife('hours')
    cacheTag('rawg-games')

    const data = await rawgFetch('/games', { search: query, page, page_size: pageSize })
    return GameResponseSchema.parse(data)
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
