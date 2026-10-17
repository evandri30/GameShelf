import { CardGridSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 pb-16 pt-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-[26rem] w-full rounded-lg md:h-[30rem]" />
            <CardGridSkeleton />
        </div>
    )
}
