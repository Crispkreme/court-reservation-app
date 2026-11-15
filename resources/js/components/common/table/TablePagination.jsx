
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
    currentPage = 1,
    totalItems = 0,
    perPage = 10,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 20, 30, 40, 50],
    itemName = "records",
    className = "",
}) {
    const safePerPage = Math.max(1, Number(perPage) || 10);
    const safeTotal = Math.max(0, Number(totalItems) || 0);

    const totalPages = Math.max(
        1,
        Math.ceil(safeTotal / safePerPage)
    );

    const safePage = Math.min(
        Math.max(1, Number(currentPage) || 1),
        totalPages
    );

    const startItem =
        safeTotal === 0
            ? 0
            : (safePage - 1) * safePerPage + 1;

    const endItem = Math.min(
        safePage * safePerPage,
        safeTotal
    );

    const maxVisible = 5;

    let startPage = Math.max(
        1,
        safePage - Math.floor(maxVisible / 2)
    );

    const endPage = Math.min(
        totalPages,
        startPage + maxVisible - 1
    );

    startPage = Math.max(
        1,
        endPage - maxVisible + 1
    );

    const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
    );

    const buttonClass = `
        flex h-9 w-9 items-center justify-center
        rounded-lg border border-gray-200
        text-gray-600 transition-colors
        hover:bg-red-50 hover:text-red-700
        disabled:cursor-not-allowed
        disabled:opacity-40
    `;

    return (
        <div
            className={`
                flex flex-col gap-4
                border-t border-gray-100
                bg-white px-5 py-4
                lg:flex-row lg:items-center
                lg:justify-between
                ${className}
            `}
        >
            {/* Rows Per Page */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-500">
                    Rows per page
                </span>

                <select
                    value={safePerPage}
                    onChange={(e) =>
                        onPerPageChange?.(
                            Number(e.target.value)
                        )
                    }
                    aria-label="Rows per page"
                    className="
                        rounded-lg border border-gray-200
                        bg-white px-3 py-2
                        text-sm font-medium text-gray-700
                        outline-none transition
                        focus:border-red-500
                        focus:ring-2 focus:ring-red-100
                    "
                >
                    {perPageOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <span className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                        {startItem}–{endItem}
                    </span>
                    {" "}of{" "}
                    <span className="font-semibold text-gray-900">
                        {safeTotal}
                    </span>
                    {" "}{itemName}
                </span>
            </div>

            {/* Pagination */}
            <nav
                aria-label="Table pagination"
                className="flex flex-wrap items-center gap-1"
            >
                <button
                    type="button"
                    onClick={() =>
                        onPageChange?.(safePage - 1)
                    }
                    disabled={safePage === 1}
                    aria-label="Previous page"
                    className={buttonClass}
                >
                    <ChevronLeft size={17} />
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() =>
                            onPageChange?.(page)
                        }
                        aria-label={`Go to page ${page}`}
                        aria-current={
                            safePage === page
                                ? "page"
                                : undefined
                        }
                        className={`
                            flex h-9 min-w-9 items-center
                            justify-center rounded-lg
                            px-2 text-sm font-semibold
                            transition-colors
                            ${
                                safePage === page
                                    ? "bg-red-700 text-white"
                                    : "border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-700"
                            }
                        `}
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() =>
                        onPageChange?.(safePage + 1)
                    }
                    disabled={safePage === totalPages}
                    aria-label="Next page"
                    className={buttonClass}
                >
                    <ChevronRight size={17} />
                </button>
            </nav>
        </div>
    );
}
