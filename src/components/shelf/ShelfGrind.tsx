import ShelfCard from "./ShelfCard"
import type { ShelfProps } from '@/types'

type Props = {
    shelf: ShelfProps[]
}


export default function ShelfGrind({ shelf }: Props) {
    return (
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl w-full">
            {shelf.map((game) => (
                <ShelfCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    slug={game.slug}
                    status={game.status}
                    backgroundImage={game.backgroundImage}
                />
            ))}
        </section>
    )
}