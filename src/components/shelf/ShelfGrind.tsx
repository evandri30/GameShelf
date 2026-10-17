import ShelfCard from "./ShelfCard"
import type { ShelfProps } from '@/types'

type Props = {
    shelf: ShelfProps[]
}

export default function ShelfGrind({ shelf }: Props) {
    return (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shelf.map((game, i) => (
                // the first row is above the fold
                <ShelfCard key={game.id} {...game} eager={i < 4} />
            ))}
        </section>
    )
}
