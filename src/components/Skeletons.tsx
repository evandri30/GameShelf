import { Skeleton } from "@/components/ui/Card"

export function PageHeaderSkeleton() {
    return (
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-56" />
            <Skeleton className="h-5 w-80 max-w-full" />
        </div>
    )
}

export function CardGridSkeleton({ count = 8, imageClass = "h-40" }: { count?: number; imageClass?: string }) {
    return (
        <div className="grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface">
                    <Skeleton className={`${imageClass} rounded-none`} />
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function HeroSkeleton({ className = "h-100" }: { className?: string }) {
    return <Skeleton className={`w-full rounded-lg ${className}`} />
}
