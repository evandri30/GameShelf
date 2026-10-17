export default function PageHeader({ total }: { total: number }) {
    return (
        <section className="space-y-2">
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
                My Shelf
            </h1>
            <p className="text-muted">
                {total > 0
                    ? <><span className="font-mono text-accent">{total}</span> {total === 1 ? "game" : "games"}. Track your journey, remember what you finished.</>
                    : "Track your journey. Manage what you play. Remember what you finished."}
            </p>
        </section>
    )
}
