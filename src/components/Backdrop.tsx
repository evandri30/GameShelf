import Image from "next/image"
import { getCroppedImageUrl } from "@/utils/image"

// Full-bleed blurred art behind a page header. A small source is enough once it's blurred.
export default function Backdrop({ src }: { src: string | null }) {
    if (!src) return null

    return (
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden">
            <Image
                src={getCroppedImageUrl(src, 640)}
                alt=""
                fill
                sizes="100vw"
                quality={40}
                // by area this is usually the LCP element, so don't lazy-load it
                loading="eager"
                className="scale-110 object-cover opacity-35 blur-2xl"
            />
            <div className="absolute inset-0 bg-linear-to-b from-base/30 via-base/70 to-base" />
        </div>
    )
}
