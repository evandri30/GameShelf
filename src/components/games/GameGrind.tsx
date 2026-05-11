import GameCard from "./GameCard";
import type { GameProps } from "@/types";
import { Book } from 'lucide-react'

type GameGrindProps = {
    games: GameProps[];
    searchQuery?: string;
    currentPage: number;
}

export default function GameGrind({ games, searchQuery, currentPage }: GameGrindProps) {
    return (
        <div className="mt-16 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-6">
                <Book className="w-6 h-6 text-zinc-400" />
                <h2 className="text-2xl font-bold text-white">Discover the game</h2>
            </div>
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                {games.map((game) => (
                    <GameCard key={game.id} searchQuery={searchQuery} currentPage={currentPage} game={game} />
                ))}
            </section>
        </div>
    )
}