export default function PageHeader() {
    return (
        <section className="flex max-w-3xl flex-col items-center gap-4">
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
                Shelf
            </h1>
            <p className="max-w-xl text-muted">
                Track your journey. Manage what you play. Remember what you finished.
            </p>
        </section>
    )
}
