import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationProps } from "@/types"
import { discoverHref } from "@/constants/discover"

const itemClass = "flex h-10 min-w-10 items-center justify-center rounded-md border px-3 font-mono text-sm transition-colors"

export default function Pagination({ currentPage, totalPages, hasNext, hasPrev, query }: PaginationProps) {
    const pageHref = (page: number) => discoverHref({ ...query, page })

    // current page plus two neighbours on each side, clamped to the range
    const pages = Array.from({ length: 5 }, (_, i) => currentPage - 2 + i).filter((p) => p >= 1 && p <= totalPages)

    if (totalPages <= 1) return null

    return (
        <nav aria-label="Pagination" className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
                {hasPrev ? (
                    <Link href={pageHref(currentPage - 1)} aria-label="Previous page" className={`${itemClass} border-line-strong text-fg hover:border-accent hover:text-accent`}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${itemClass} border-line text-subtle`} aria-hidden><ChevronLeft className="h-4 w-4" /></span>
                )}

                {pages[0] > 1 && (
                    <>
                        <Link href={pageHref(1)} className={`${itemClass} border-line-strong text-muted hover:border-accent hover:text-accent`}>1</Link>
                        {pages[0] > 2 && <span className="px-1 text-subtle">…</span>}
                    </>
                )}

                {pages.map((page) => (
                    <Link
                        key={page}
                        href={pageHref(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`${itemClass} ${page === currentPage
                            ? "border-accent bg-accent font-bold text-accent-fg"
                            : "border-line-strong text-muted hover:border-accent hover:text-accent"}`}
                    >
                        {page}
                    </Link>
                ))}

                {pages[pages.length - 1] < totalPages && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-subtle">…</span>}
                        <Link href={pageHref(totalPages)} className={`${itemClass} border-line-strong text-muted hover:border-accent hover:text-accent`}>
                            {totalPages.toLocaleString("en-US")}
                        </Link>
                    </>
                )}

                {hasNext ? (
                    <Link href={pageHref(currentPage + 1)} aria-label="Next page" className={`${itemClass} border-line-strong text-fg hover:border-accent hover:text-accent`}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${itemClass} border-line text-subtle`} aria-hidden><ChevronRight className="h-4 w-4" /></span>
                )}
            </div>

            <p className="font-mono text-xs text-subtle">
                Page {currentPage.toLocaleString("en-US")} of {totalPages.toLocaleString("en-US")}
            </p>
        </nav>
    )
}
