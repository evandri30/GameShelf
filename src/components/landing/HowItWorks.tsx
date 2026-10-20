import Image from "next/image"
import type { ReactNode } from "react"
import { Plus, Search, Star } from "lucide-react"
import { gotyWinners } from "@/constants/gotywinner"
import { SHELF_STATUSES, STATUS_META } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"
import GrowBars from "./GrowBars"

// the search mock types a real query and shows the GOTY winners it matches
const QUERY = "the w"
const results = gotyWinners.filter((g) => g.background_image && g.name.toLowerCase().includes(QUERY)).slice(0, 2)

function Step({ n, title, text, children }: { n: number; title: string; text: string; children: ReactNode }) {
    return (
        <li className="flex min-w-0 flex-col gap-5">
            <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">{n}</span>
                <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{text}</p>
                </div>
            </div>
            {/* a slice of the real interface for this step */}
            <div aria-hidden className="mt-auto rounded-lg border border-line bg-surface p-4">{children}</div>
        </li>
    )
}

export default function HowItWorks() {
    return (
        <section aria-labelledby="how-heading" className="space-y-10">
            <h2 id="how-heading" className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
                From &ldquo;I should play that&rdquo; to finished
            </h2>

            <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
                <Step n={1} title="Find it" text="Search over 900,000 games, or browse by genre, platform and year.">
                    <div className="flex h-9 items-center gap-2 rounded-md border border-line bg-base px-3 text-sm text-fg">
                        <Search className="h-3.5 w-3.5 text-subtle" />
                        {QUERY}
                        <span className="h-4 w-px animate-pulse bg-accent" />
                    </div>
                    <ul className="mt-3 space-y-2">
                        {results.map((game) => (
                            <li key={game.id} className="flex items-center gap-3">
                                <div className="relative aspect-video w-14 shrink-0 overflow-hidden rounded border border-line">
                                    <Image src={getCroppedImageUrl(game.background_image, 200)} alt="" fill sizes="56px" className="object-cover" />
                                </div>
                                <span className="min-w-0 flex-1 truncate text-sm">{game.name}</span>
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent text-accent-fg"><Plus className="h-3.5 w-3.5" /></span>
                            </li>
                        ))}
                    </ul>
                </Step>

                <Step n={2} title="Shelve it" text="Mark it planned, playing, completed or dropped. Add a rating, your hours and a few notes.">
                    <div className="flex flex-wrap gap-1.5">
                        {SHELF_STATUSES.map((status) => (
                            <span
                                key={status}
                                className={`rounded border px-2 py-1 text-xs font-medium ${status === "COMPLETED" ? STATUS_META[status].badge : "border-line text-muted"}`}
                            >
                                {STATUS_META[status].label}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-accent text-accent" : "text-line-strong"}`} />)}
                        </span>
                        <span className="font-mono text-sm text-muted">62 h</span>
                    </div>
                    <p className="mt-3 rounded-md bg-base px-3 py-2 text-sm text-muted">&ldquo;That final boss. Wow.&rdquo;</p>
                </Step>

                <Step n={3} title="Look back" text="See what you finished each month, and share your year in review with friends.">
                    <GrowBars counts={[1, 2, 1, 3, 2, 0, 4, 2, 3, 1, 2, 4]} />
                </Step>
            </ol>
        </section>
    )
}
