import { Skeleton } from "@/components/ui/Card"

export function CardGridSkeleton({ count = 6, columns = "sm:grid-cols-2 lg:grid-cols-3" }: { count?: number; columns?: string }) {
    return (
        <div className={`grid w-full grid-cols-1 gap-5 ${columns}`}>
            {Array.from({ length: count }, (_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
        </div>
    )
}

// key art + title block, shared by the game and shelf detail pages
export function DetailHeaderSkeleton() {
    return (
        <div className="grid items-end gap-8 md:grid-cols-[1.3fr_1fr]">
            <Skeleton className="aspect-video rounded-lg" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-56" />
            </div>
        </div>
    )
}
