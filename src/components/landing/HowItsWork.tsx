import type { HowItsWorkProps } from "@/types"

export default function HowItsWork({ no, title, description }: HowItsWorkProps) {
    return (
        <div
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6
                 flex flex-col items-center text-center gap-4
                 transition-all duration-300 hover:bg-zinc-900 hover:-translate-y-1.5 hover:scale-[1.02] mt-12"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full
                 border border-zinc-700 text-sm font-semibold">
                <span className="text-xs uppercase tracking-wider text-zinc-500">
                    {no}
                </span>
            </div>

            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
        </div>
    )
}