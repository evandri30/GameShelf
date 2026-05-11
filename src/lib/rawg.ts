import type { GameDetailProps, GameResponseProps } from "@/types";
import { GameDetailSchema, GameResponseSchema } from "@/schemas/game.schema"
import { gotyWinners } from "@/constants/gotywinner"

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
    const res = await fetch(`${BASE_URL}/games/${slug}?key=${API_KEY}`, {
        next: { revalidate: 3600 }
    })

    if (!res.ok) {
        throw new Error("Failed to fetch Game")
    }

    const data = await res.json()
    return GameDetailSchema.parse(data)
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

export async function getGOTYGames(): Promise<GameResponseProps> {
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
}