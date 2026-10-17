import GameCard from "./GameCard";
import type { GameProps } from "@/types";
import type { ShelfIndex } from "@/services/shelf.service";
import { Compass, SearchX } from 'lucide-react'
import { SectionHeading } from '@/components/ui/Card'

type GameGrindProps = {
    games: GameProps[];
    heading: string;
    backHref: string;
    shelfIndex: ShelfIndex;
    aboveFold?: boolean;
}

export default function GameGrind({ games, heading, backHref, shelfIndex, aboveFold = false }: GameGrindProps) {
    return (
        <section className="w-full space-y-6">
            <SectionHeading title={heading} icon={Compass} />

            {games.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong py-16 text-center text-muted">
                    <SearchX className="h-10 w-10 text-subtle" />
                    <p>No games found. Try a different title or loosen the filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {games.map((game, i) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            backHref={backHref}
                            entry={shelfIndex[game.id]}
                            // without the GOTY banner (search, filters, later pages) the first row is above the fold
                            eager={aboveFold && i < 3}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
