type PageHeaderProps = {
    totalGames: number;
}

export default function PageHeader({ totalGames }: PageHeaderProps) {
    return (
        <section className="text-center max-w-3xl flex flex-col items-center gap-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                Games
            </h1>
            <p className="text-lg text-zinc-300 max-w-2xl">
                Discovery {totalGames.toLocaleString()} games from our collection.
            </p>
        </section>
    )
}