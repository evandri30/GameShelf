import GameCard from "./GameCard";
import type { GameProps } from "@/types";
import { Book } from 'lucide-react'
import { SectionHeading } from '@/components/ui/Card'

type GameGrindProps = {
    games: GameProps[];
    searchQuery?: string;
    currentPage: number;
}

export default function GameGrind({ games, searchQuery, currentPage }: GameGrindProps) {
    return (
        <div className="mt-16 flex w-full max-w-7xl flex-col gap-4">
            <div className="mb-6">
                <SectionHeading title={searchQuery ? "Search results" : "Discover games"} icon={Book} />
            </div>
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                {games.map((game) => (
                    <GameCard key={game.id} searchQuery={searchQuery} currentPage={currentPage} game={game} />
                ))}
            </section>
        </div>
    )
}