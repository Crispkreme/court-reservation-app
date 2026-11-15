
import { useMemo, useState } from 'react';

export default function usePagination({
    data = [],
    initialPage = 1,
    initialPerPage = 10,
} = {}) {
    // Pagination states
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [perPage, setPerPage] = useState(initialPerPage);

    // Calculate total pages
    const totalItems = data.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / perPage)
    );

    // Ensure current page is valid
    const safeCurrentPage = Math.min(
        Math.max(1, currentPage),
        totalPages
    );

    // Paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * perPage;

        return data.slice(
            startIndex,
            startIndex + perPage
        );
    }, [data, safeCurrentPage, perPage]);

    // Change page
    const handlePageChange = (page) => {
        setCurrentPage(
            Math.min(Math.max(1, page), totalPages)
        );
    };

    // Change rows per page
    const handlePerPageChange = (value) => {
        const newPerPage = Number(value);

        if (!Number.isInteger(newPerPage) || newPerPage < 1) {
            return;
        }

        setPerPage(newPerPage);
        setCurrentPage(1);
    };

    // Reset pagination
    const resetPagination = () => {
        setCurrentPage(1);
    };

    return {
        currentPage: safeCurrentPage,
        perPage,
        totalItems,
        totalPages,
        paginatedData,
        handlePageChange,
        handlePerPageChange,
        resetPagination,
    };
}