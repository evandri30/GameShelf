import Image from "next/image"
import Link from "next/link"
import { gotyWinners } from "@/constants/gotywinner"
import { STATUS_META } from "@/constants/status"
import { getCroppedImageUrl } from "@/utils/image"
import { buttonClass } from "@/components/ui/Button"

export const metadata = { title: "Page not found | GameShelf" }

// two real covers either side of the slot the missing page should have been in
const [left, right] = gotyWinners.filter((g) => g.background_image).slice(3, 5)

function Cover({ src }: { src: string | null }) {
    return (
        <div className="relative hidden aspect-3/4 w-28 shrink-0 overflow-hidden rounded-md border border-line opacity-40 grayscale sm:block md:w-36">
            {src && <Image src={getCroppedImageUrl(src, 420)} alt="" fill sizes="144px" className="object-cover" />}
        </div>
    )
}

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-3xl animate-fade-up flex-col items-center justify-center gap-10 px-6 py-16 text-center">
            <div aria-hidden className="flex items-end gap-3 md:gap-4">
                <Cover src={left?.background_image ?? null} />

                <div className="relative flex aspect-3/4 w-36 shrink-0 flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line-strong bg-surface/60 md:w-44">
                    <span className="font-display text-5xl font-bold tracking-tight text-fg md:text-6xl">404</span>
                    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${STATUS_META.DROPPED.badge}`}>Not found</span>
                </div>

                <Cover src={right?.background_image ?? null} />
            </div>

            <div className="space-y-3">
                <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">This page isn&apos;t on the shelf</h1>
                <p className="mx-auto max-w-md text-muted">
                    The link might be broken, or the page was moved or removed. Check the address, or head back and keep browsing.
                </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/" className={buttonClass("primary", "lg")}>Back to home</Link>
                <Link href="/games" className={buttonClass("secondary", "lg")}>Discover games</Link>
            </div>
        </div>
    )
}
