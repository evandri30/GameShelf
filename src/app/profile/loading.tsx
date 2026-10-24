import { Skeleton } from "@/components/ui/Card"

export default function Loading() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
            <div className="space-y-3">
                <Skeleton className="h-12 w-64 max-w-full" />
                <Skeleton className="h-5 w-72 max-w-full" />
            </div>
            <Skeleton className="h-36" />
            <Skeleton className="h-56" />
            <Skeleton className="h-28" />
        </div>
    )
}
