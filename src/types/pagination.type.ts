import type { DiscoverQuery } from "@/constants/discover"

export type PaginationProps = {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    // search + filters to keep on every page link
    query: DiscoverQuery;
}