import { HeroSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <Skeleton className="mb-8 h-5 w-28" />
            <HeroSkeleton className="mb-8 h-96" />
            <Skeleton className="mb-4 h-10 w-2/3" />
            <Skeleton className="mb-8 h-7 w-56" />
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-64" />
                <Skeleton className="h-64 md:col-span-2" />
            </div>
        </div>
    )
}
