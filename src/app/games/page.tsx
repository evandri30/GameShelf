import { getGames, searchGames } from "@/lib/rawg"
import { gotyWinners } from "@/constants/gotywinner"
import PageHeader from "@/components/games/PageHeader"
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
        <div className="relative flex min-h-screen animate-fade-up flex-col items-center px-6 py-16">
            {/* Header */}
            <PageHeader totalGames={data.count} />

            {/* GOTY Slider */}
            {showGoty && <GOTYSlider games={gotyWinners} />}

            {/* SearchBar */}
            <SearchBar searchQuery={searchQuery} totalGames={data.count} />

            {/* Games Grid */}
            <GameGrind games={data.results} searchQuery={searchQuery} currentPage={currentPage} />

            {/* Pagination */}
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
