import GameCard from "./GameCard";
import type { GameProps } from "@/types";
import { Compass, SearchX } from 'lucide-react'
import { SectionHeading } from '@/components/ui/Card'

type GameGrindProps = {
    games: GameProps[];
    searchQuery?: string;
    currentPage: number;
    aboveFold?: boolean;
}

export default function GameGrind({ games, searchQuery, currentPage, aboveFold = false }: GameGrindProps) {
    return (
        <section className="w-full space-y-6">
            <SectionHeading title={searchQuery ? `Results for "${searchQuery}"` : "Popular right now"} icon={Compass} />

            {games.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong py-16 text-center text-muted">
                    <SearchX className="h-10 w-10 text-subtle" />
                    <p>No games found. Try a different title.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {games.map((game, i) => (
                        // without the GOTY banner (search, later pages) the first row is above the fold
                        <GameCard key={game.id} searchQuery={searchQuery} currentPage={currentPage} game={game} eager={aboveFold && i < 3} />
                    ))}
                </div>
            )}
        </section>
    )
}
