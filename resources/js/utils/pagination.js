export const filterData = (
    data = [],
    {
        search = "",
        searchFields = [],
        filters = {},
    } = {}
) => {
    const items = Array.isArray(data) ? data : [];
    const query = String(search).trim().toLowerCase();

    return items.filter((item) => {
        // Search across selected fields
        const matchesSearch =
            !query ||
            searchFields.some((field) => {
                const value = item[field];

                return String(value ?? "")
                    .toLowerCase()
                    .includes(query);
            });

        // Apply additional filters
        const matchesFilters = Object.entries(filters).every(
            ([field, value]) => {
                if (
                    value === "" ||
                    value === null ||
                    value === undefined
                ) {
                    return true;
                }

                return item[field] === value;
            }
        );

        return matchesSearch && matchesFilters;
    });
};

export const paginate = (
    data = [],
    currentPage = 1,
    perPage = 10
) => {
    const items = Array.isArray(data) ? data : [];

    const safePerPage = Math.max(
        1,
        Math.floor(Number(perPage) || 10)
    );

    const totalItems = items.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / safePerPage)
    );

    const safePage = Math.min(
        Math.max(1, Math.floor(Number(currentPage) || 1)),
        totalPages
    );

    const startIndex = (safePage - 1) * safePerPage;

    return {
        paginatedData: items.slice(
            startIndex,
            startIndex + safePerPage
        ),
        totalItems,
        totalPages,
        safePage,
        perPage: safePerPage,
        startItem: totalItems === 0 ? 0 : startIndex + 1,
        endItem: Math.min(
            startIndex + safePerPage,
            totalItems
        ),
    };
};
