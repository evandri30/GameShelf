export default function PageHeader() {
    return (
        <section className="max-w-3xl flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Shelf
            </h1>
            <p className="text-zinc-400 max-w-xl">
                Track your journey. Manage what you play. Remember what you finished.
            </p>
        </section>
    )
}