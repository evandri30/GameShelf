import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16">
            <div className="space-y-4">
                <Skeleton className="h-14 w-72 max-w-full" />
                <Skeleton className="h-5 w-64 max-w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-36" />)}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    )
}
