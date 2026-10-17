import Image from "next/image"
import { gotyWinners } from "@/constants/gotywinner"
import { getCroppedImageUrl } from "@/utils/image"

type CoverCollageProps = {
    className?: string
    // columns of covers; the wall is tilted so it reads as a backdrop, not a gallery
    columns?: number
}

// Decorative wall of GOTY cover art used behind the landing hero and beside the auth form
export default function CoverCollage({ className = "", columns = 4 }: CoverCollageProps) {
    const covers = gotyWinners.filter((g) => g.background_image)
    const cols = Array.from({ length: columns }, (_, c) => covers.filter((_, i) => i % columns === c))

    return (
        <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
            <div className="flex h-full -rotate-6 scale-125 gap-3">
                {cols.map((col, c) => (
                    <div key={c} className={`flex flex-1 flex-col gap-3 ${c % 2 ? "translate-y-16" : ""}`}>
                        {[...col, ...col].map((game, i) => (
                            <div key={`${game.id}-${i}`} className="relative aspect-4/3 overflow-hidden rounded-md border border-line">
                                <Image
                                    src={getCroppedImageUrl(game.background_image, 420)}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    // above the fold, but decorative: load now without competing with the headline
                                    loading="eager"
                                    fetchPriority="low"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
