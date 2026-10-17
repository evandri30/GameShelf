import { getGames, searchGames } from "@/lib/rawg"
import { gotyWinners } from "@/constants/gotywinner"
import SearchBar from "@/components/games/SearchBar"
import GameGrind from "@/components/games/GameGrind"
import Pagination from "@/components/games/Pagination"
import GOTYSlider from "@/components/games/GOTYSlider"

type PageProps = {
    searchParams: Promise<{ page?: string, search?: string }>
}

export default async function GamePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const searchQuery = params.search || "";

    const data = searchQuery ? await searchGames(searchQuery, currentPage) : await getGames(currentPage)
    const showGoty = !searchQuery && currentPage === 1

    const totalPages = Math.ceil(data.count / 20);
    const hasNext = data.next !== null;
    const hasPrev = data.previous !== null;

    return (
        <div className="mx-auto flex max-w-7xl animate-fade-up flex-col gap-12 px-6 pb-16">
            <SearchBar searchQuery={searchQuery} totalGames={data.count} />

            {showGoty && <GOTYSlider games={gotyWinners} />}

            <GameGrind games={data.results} searchQuery={searchQuery} currentPage={currentPage} aboveFold={!showGoty} />

            <Pagination
                currentPage={currentPage}
                hasNext={hasNext}
                hasPrev={hasPrev}
                totalPages={totalPages}
                searchQuery={searchQuery}
            />
        </div>
    )
}
