import { CardGridSkeleton, HeroSkeleton, PageHeaderSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="flex flex-col items-center gap-12 px-6 py-16">
            <PageHeaderSkeleton />
            <div className="w-full max-w-7xl">
                <HeroSkeleton className="h-100 md:h-125" />
            </div>
            <Skeleton className="h-12 w-full max-w-2xl" />
            <CardGridSkeleton />
        </div>
    )
}
