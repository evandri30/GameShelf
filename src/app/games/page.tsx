import { Suspense } from "react"
import { getGames, getGOTYGames, searchGames } from "@/lib/rawg"
import { FadeIn } from "@/components/AnimatedSection"
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

    const [data, gotyData] = await Promise.all([
        searchQuery ? searchGames(searchQuery, currentPage) : getGames(currentPage),
        !searchQuery && currentPage === 1 ? getGOTYGames() : Promise.resolve(null)
    ]);

    const totalPages = Math.ceil(data.count / 20);
    const hasNext = data.next !== null;
    const hasPrev = data.previous !== null;

    return (
        <FadeIn>
            <main className="relative min-h-screen overflow-hidden px-6 py-16 flex flex-col items-center">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

                {/* Header */}
                <PageHeader totalGames={data.count} />

                {/* GOTY Slidder */}
                {gotyData && gotyData.results.length > 0 && (
                    <GOTYSlider games={gotyData.results} />
                )}

                {/* SearchBar */}
                <Suspense fallback={<div className="mt-12 w-full max-w-2xl h-12 bg-zinc-900/50 rounded-xl animate-pulse"></div>}>
                    <SearchBar searchQuery={searchQuery} totalGames={data.count} />
                </Suspense>

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
            </main>
        </FadeIn>
    )
}
