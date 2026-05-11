export type PaginationProps = {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    searchQuery?: string;
}