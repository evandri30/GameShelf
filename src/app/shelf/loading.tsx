import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="flex flex-col items-center gap-12 px-6 py-16">
            <PageHeaderSkeleton />
            <div className="flex flex-wrap justify-center gap-3">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-9 w-24" />)}
            </div>
            <CardGridSkeleton imageClass="h-48" />
        </div>
    )
}
