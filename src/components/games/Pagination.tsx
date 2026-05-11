import Link from "next/link";
import type { PaginationProps } from "@/types"

export default function Pagination({ currentPage, totalPages, hasNext, hasPrev, searchQuery }: PaginationProps) {
    return (
        <div className="flex flex-col items-center">
            <section className="mt-12 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                <Link
                    href={`/games?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ``}`}
                    className={`px-4 py-2 rounded-lg border transition ${hasPrev ? "border-zinc-700 text-white hover:border-zinc-500" : "border-zinc-800 text-zinc-600 cursor-not-allowed pointer-events-none"}`}
                >
                    prev
                </Link>

                <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                    {/* First Page */}
                    {currentPage > 3 && (
                        <>
                            <Link
                                href={`/games?page=1${searchQuery ? `&search=${searchQuery}` : ``}`}
                                className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition"
                            >
                                1
                            </Link>
                            {currentPage > 4 && (
                                <span className="text-zinc-500">...</span>
                            )}
                        </>
                    )}

                    {/* Nearby Page */}
                    {[...Array(5)].map((_, i) => {
                        const page = currentPage - 2 + i;
                        if (page < 1 || page > totalPages) return null
                        return (
                            <Link
                                key={page}
                                href={`/games?page=${page}${searchQuery ? `&search=${searchQuery}` : ``}`}
                                className={`px-3 py-2 rounded-lg border transition ${page === currentPage
                                    ? "border-zinc-500 bg-zinc-800 text-white"
                                    : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                    }`}
                            >
                                {page}
                            </Link>
                        )
                    })}

                    {/* Last Page */}
                    {currentPage < totalPages - 2 && (
                        <>
                            {currentPage < totalPages - 3 && (<span className="text-zinc-500">...</span>)}
                            <Link
                                href={`/games?page=${totalPages}${searchQuery ? `&search=${searchQuery}` : ``}`}
                                className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition"
                            >
                                {totalPages}
                            </Link>
                        </>
                    )}
                </div>

                <Link
                    href={`/games?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ``}`}
                    className={`px-4 py-2 rounded-lg border transition ${hasNext ? "border-zinc-700 text-white hover:border-zinc-500 " : "border-zinc-800 text-zinc-600 cursor-not-allowed pointer-events-none"}`}
                >
                    Next
                </Link>
            </section>

            <p className="mt-4 text-sm text-zinc-500">
                Page {currentPage} of {totalPages.toLocaleString()}
            </p>
        </div>
    )
}