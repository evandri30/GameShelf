import { CardGridSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-5 w-80 max-w-full" />
            </div>
            <CardGridSkeleton />
        </div>
    )
}
