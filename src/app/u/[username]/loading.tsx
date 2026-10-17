import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
            <div className="flex items-center gap-5">
                <Skeleton className="h-22 w-22 rounded-full" />
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-96" />
        </div>
    )
}
