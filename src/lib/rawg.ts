import type { GameDetailProps, GameResponseProps } from "@/types";
import { GameDetailSchema, GameResponseSchema } from "@/schemas/game.schema"
import { gotyWinners } from "@/constants/gotywinner"
import { unstable_cache } from "next/cache"
import dns from "node:dns"
import sanitizeHtml from "sanitize-html"

if (typeof window === 'undefined') {
    dns.setDefaultResultOrder('ipv4first');
}

const BASE_URL = "https://api.rawg.io/api";
const API_KEY = process.env.RAWG_API_KEY;

export async function getGames(page: number = 1, pageSize: number = 20): Promise<GameResponseProps> {
    const res = await fetch(`${BASE_URL}/games?key=${API_KEY}&page=${page}&page_size=${pageSize}`, {
        next: { revalidate: 3600 }
        })

    if (!res.ok) {
        throw new Error("Failed to fetch Game")
    }

    const data = await res.json()
    return GameResponseSchema.parse(data)
}

export async function getGameBySlug(slug: string): Promise<GameDetailProps> {
    const res = await fetch(`${BASE_URL}/games/${encodeURIComponent(slug)}?key=${API_KEY}`, {
        next: { revalidate: 3600 }
    })

    if (!res.ok) {
        throw new Error("Failed to fetch Game")
    }

    const data = await res.json()
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

export async function searchGames(query: string, page: number = 1, pageSize: number = 20): Promise<GameResponseProps> {
    const res = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`,
        {
            next: { revalidate: 3600 }
        }
    )

    if (!res.ok) {
        throw new Error("Failed to fetch Game")
    }

    const data = await res.json()
    return GameResponseSchema.parse(data)
}

export const getGOTYGames = unstable_cache(
    async (): Promise<GameResponseProps> => {
        const promises = gotyWinners.map(slug => fetch(`${BASE_URL}/games/${slug}?key=${API_KEY}`,
            {
                next: { revalidate: 3600 }
            })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch game`)
                return res.json()
            })
        )

        const results = await Promise.all(promises)

        const response = {
            count: results.length,
            next: null,
            previous: null,
            results: results
        }

        return GameResponseSchema.parse(response)
    },
    ['goty-games-cache'],
    { revalidate: 86400 } 
)