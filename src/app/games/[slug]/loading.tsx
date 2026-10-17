import { HeroSkeleton } from "@/components/Skeletons"
import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="flex flex-col items-center px-6 py-16">
            <div className="mb-8 w-full max-w-6xl">
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="w-full max-w-6xl">
                <HeroSkeleton />
            </div>
            <div className="mt-8 grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                <Skeleton className="h-96 lg:col-span-2" />
                <Skeleton className="h-96" />
            </div>
        </div>
    )
}
