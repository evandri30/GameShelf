import { ExternalLink } from "lucide-react"
import type { GameDetailProps } from "@/types"
import { Card } from "@/components/ui/Card"
import ExpandableHtml from "./ExpandableHtml"

type Props = {
    game: GameDetailProps
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 border-b border-line py-3 text-sm last:border-0">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-fg">{children}</dd>
        </div>
    )
}

function ChipGroup({ title, items, variant = "outline" }: { title: string; items: { id: number; name: string }[]; variant?: "outline" | "solid" }) {
    if (!items.length) return null

    return (
        <Card className="p-6">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span
                        key={item.id}
                        className={variant === "outline"
                            ? "rounded border border-line-strong px-2.5 py-1 text-sm text-fg"
                            : "rounded bg-surface-2 px-2 py-1 text-xs text-muted"}
                    >
                        {item.name}
                    </span>
                ))}
            </div>
        </Card>
    )
}

export default function PageContentDetail({ game }: Props) {
    return (
        <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            {/* About */}
            <Card className="self-start p-6 md:p-8 lg:col-span-2">
                <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wide">About</h2>
                <ExpandableHtml html={game.description} />
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
                <Card className="p-6">
                    <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">Game info</h2>
                    <dl>
                        {game.released && (
                            <InfoRow label="Released">
                                {new Date(game.released).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                            </InfoRow>
                        )}
                        {game.playtime > 0 && <InfoRow label="Avg. playtime"><span className="font-mono">{game.playtime}h</span></InfoRow>}
                        {game.developers.length > 0 && <InfoRow label="Developer">{game.developers.map(d => d.name).join(', ')}</InfoRow>}
                        {game.publishers.length > 0 && <InfoRow label="Publisher">{game.publishers.map(p => p.name).join(', ')}</InfoRow>}
                        {game.website && (
                            <InfoRow label="Website">
                                <a href={game.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                                    Official site <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </InfoRow>
                        )}
                    </dl>
                </Card>

                <ChipGroup title="Platforms" items={game.platforms.map(({ platform }) => platform)} />
                <ChipGroup title="Genres" items={game.genres} />
                <ChipGroup title="Tags" items={game.tags.slice(0, 12)} variant="solid" />
            </div>
        </section>
    )
}
