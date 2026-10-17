import { CardGridSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12">
            <div className="space-y-3">
                <Skeleton className="h-12 w-60" />
                <Skeleton className="h-5 w-80 max-w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <CardGridSkeleton count={8} columns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        </div>
    )
}
