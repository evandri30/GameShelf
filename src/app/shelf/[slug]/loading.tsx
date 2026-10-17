import { DetailHeaderSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
            <Skeleton className="h-5 w-36" />
            <DetailHeaderSkeleton />
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-56" />
                <Skeleton className="h-56 md:col-span-2" />
            </div>
        </div>
    )
}
