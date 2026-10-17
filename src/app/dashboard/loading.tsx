import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
            <div className="space-y-3">
                <Skeleton className="h-12 w-64 max-w-full" />
                <Skeleton className="h-5 w-72 max-w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>
        </div>
    )
}
