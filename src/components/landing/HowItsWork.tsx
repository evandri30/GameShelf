import type { HowItsWorkProps } from "@/types"

export default function HowItsWork({ no, title, description }: HowItsWorkProps) {
    return (
        <div
            className="group rounded-xl border border-line bg-surface p-6
                 flex flex-col items-center text-center gap-4
                 transition-all duration-300 hover:bg-surface-2 hover:-translate-y-1.5 hover:scale-[1.02] mt-12"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full
                 border border-line-strong text-sm font-semibold">
                <span className="text-xs uppercase tracking-wider text-subtle">
                    {no}
                </span>
            </div>

            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
        </div>
    )
}