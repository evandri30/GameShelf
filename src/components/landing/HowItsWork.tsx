import type { HowItsWorkProps } from "@/types"

export default function HowItsWork({ no, title, description }: HowItsWorkProps) {
    return (
        <li className="relative rounded-lg border border-line bg-surface p-6 text-left">
            <span className="font-mono text-4xl font-bold text-accent/30">0{no}</span>
            <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide">{title}</h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
        </li>
    )
}
