import { DetailHeaderSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
            <Skeleton className="h-5 w-36" />
            <DetailHeaderSkeleton />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="h-96 lg:col-span-2" />
                <Skeleton className="h-96" />
            </div>
        </div>
    )
}
