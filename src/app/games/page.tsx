import { after } from "next/server"
import { getGenres, getParentPlatforms, listGames } from "@/lib/rawg"
import { getSession } from "@/auth"
import { getUserShelfIndex, type ShelfIndex } from "@/services/shelf.service"
import { gotyWinners } from "@/constants/gotywinner"
import { FILTER_KEYS, discoverHref, type DiscoverQuery } from "@/constants/discover"
import SearchBar from "@/components/games/SearchBar"
import DiscoverFilters from "@/components/games/DiscoverFilters"
import GameGrind from "@/components/games/GameGrind"
import Pagination from "@/components/games/Pagination"
import GOTYSlider from "@/components/games/GOTYSlider"

export const metadata = { title: "Discover | GameShelf" }

type PageProps = {
    searchParams: Promise<{ page?: string; search?: string; genre?: string; platform?: string; ordering?: string; year?: string }>
}

export default async function GamePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const query: DiscoverQuery = {
        page: Number(params.page) || 1,
        search: params.search || undefined,
        genre: params.genre || undefined,
        platform: params.platform || undefined,
        ordering: params.ordering || undefined,
        year: params.year || undefined,
    }
    const hasFilters = FILTER_KEYS.some((key) => query[key])

    const [data, genres, platforms, shelfIndex] = await Promise.all([
        listGames(query),
        getGenres(),
        getParentPlatforms(),
        // rawgId -> shelf entry, to badge games the user already has; runs alongside RAWG
        getSession().then((session): Promise<ShelfIndex> | ShelfIndex => session?.user?.id ? getUserShelfIndex(session.user.id) : {}),
    ])

    const currentYear = new Date().getUTCFullYear()
    const years = Array.from({ length: currentYear - 1979 }, (_, i) => {
        const year = String(currentYear - i)
        return { value: year, label: year }
    })

    const showGoty = !query.search && !hasFilters && query.page === 1
    const totalPages = Math.ceil(data.count / 20);

    // Warm the cache for the next pages the pagination links to, after the response is sent
    after(() => Promise.allSettled(
        [1, 2].map((d) => query.page! + d)
            .filter((page) => page <= totalPages)
            .map((page) => listGames({ ...query, page }))
    ))

    const heading = query.search ? `Results for "${query.search}"` : hasFilters ? "Filtered games" : "Popular right now"

    return (
        <div className="mx-auto flex max-w-7xl animate-fade-up flex-col gap-12 px-6 pb-16">
            <SearchBar searchQuery={query.search ?? ""} totalGames={data.count} query={query} />

            <DiscoverFilters query={query} genres={genres} platforms={platforms} years={years} />

            {showGoty && <GOTYSlider games={gotyWinners} />}

            <GameGrind
                games={data.results}
                heading={heading}
                backHref={discoverHref(query)}
                shelfIndex={shelfIndex}
                aboveFold={!showGoty}
            />

            <Pagination
                currentPage={query.page!}
                hasNext={data.next !== null}
                hasPrev={data.previous !== null}
                totalPages={totalPages}
                query={query}
            />
        </div>
    )
}
