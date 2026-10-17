// Sort options shown in Discover; the empty value keeps RAWG's default popularity order
export const GAME_ORDERINGS = [
    { value: "", label: "Popular" },
    { value: "-rating", label: "Top rated" },
    { value: "-metacritic", label: "Metacritic" },
    { value: "-released", label: "Newest" },
    { value: "name", label: "Title A–Z" },
] as const

export type DiscoverQuery = {
    page?: number
    search?: string
    genre?: string
    platform?: string
    ordering?: string
    year?: string
}

export const FILTER_KEYS = ["genre", "platform", "ordering", "year"] as const

// One place that builds Discover URLs, so search, filters, pagination and "back" links agree
export function discoverHref(query: DiscoverQuery) {
    const params = new URLSearchParams()
    if (query.search) params.set("search", query.search)
    for (const key of FILTER_KEYS) {
        if (query[key]) params.set(key, query[key])
    }
    if (query.page && query.page > 1) params.set("page", String(query.page))
    const qs = params.toString()
    return qs ? `/games?${qs}` : "/games"
}
