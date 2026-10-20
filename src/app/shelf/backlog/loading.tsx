import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-5 w-96 max-w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        </div>
    )
}
