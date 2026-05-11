import { Gamepad2, MoveRight } from "lucide-react"
import Link from "next/link"


export default function Header() {
    return (
        <>
            <span className="flex justify-center items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-400">
                <Gamepad2 /> Built for gamers
            </span>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                GameShelf
            </h1>

            <p className="text-lg text-zinc-300 max-w-2xl">
                Discover, track, and share your favorite video games — all in one place.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                    href="/auth"
                    className="group relative inline-flex items-center gap-2
             px-7 py-3 rounded-lg bg-white text-black font-medium
             hover:-translate-y-0.5
             hover:shadow-[0_15px_35px_rgba(255,255,255,0.25)]
             transition"
                >
                    Get Started
                    <MoveRight
                        className="w-4 h-4 transition-transform
               group-hover:translate-x-1"
                        aria-hidden
                    />
                </Link>

                <Link
                    href={"/"}
                    className="px-7 py-3 rounded-lg border border-zinc-700 text-zinc-300
                    hover:bg-zinc-900 transition"
                >
                    Learn More
                </Link>
            </div>

            <p className="mt-3 text-sm text-zinc-400">
                No ads. No clutter. Just your games.
            </p>
        </>
    )
}