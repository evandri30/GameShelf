import { Dices, Download, Globe, ListOrdered, ListPlus, Sparkles } from "lucide-react"

const extras = [
    { icon: ListOrdered, title: "Backlog in order", text: "Drag your planned games into the order you want to play them." },
    { icon: Dices, title: "Can't decide?", text: "Let the dice pick your next game from the backlog." },
    { icon: ListPlus, title: "Your own lists", text: "Group games however you like, from co-op nights to comfort games." },
    { icon: Globe, title: "Public profile", text: "Share your shelf and stats at your own link, or keep it private." },
    { icon: Sparkles, title: "Year in review", text: "A recap of everything you finished, ready to share." },
    { icon: Download, title: "Your data", text: "Download your whole shelf as CSV or JSON whenever you want." },
]

export default function MoreFeatures() {
    return (
        <section aria-labelledby="more-heading" className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <h2 id="more-heading" className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
                Also on your shelf
            </h2>
            <dl className="grid gap-x-10 sm:grid-cols-2">
                {extras.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-4 border-t border-line py-5">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                        <div className="space-y-1">
                            <dt className="font-medium text-fg">{title}</dt>
                            <dd className="text-sm leading-relaxed text-muted">{text}</dd>
                        </div>
                    </div>
                ))}
            </dl>
        </section>
    )
}
