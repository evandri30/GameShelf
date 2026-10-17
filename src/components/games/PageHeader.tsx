type PageHeaderProps = {
    totalGames: number;
}

export default function PageHeader({ totalGames }: PageHeaderProps) {
    return (
        <section className="flex max-w-3xl flex-col items-center gap-4 text-center">
            <h1 className="font-display text-5xl font-bold uppercase tracking-wide md:text-6xl">
                Games
            </h1>
            <p className="max-w-2xl text-lg text-muted">
                Discover <span className="font-mono text-accent">{totalGames.toLocaleString("en-US")}</span> games from our collection.
            </p>
        </section>
    )
}
