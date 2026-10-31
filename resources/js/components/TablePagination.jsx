
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
    currentPage,
    setPage,
    totalItems = 0,
    pageSize = 10,
}) {
    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / pageSize)
    );

    const safePage = Math.min(
        Math.max(1, currentPage),
        totalPages
    );

    const startItem =
        totalItems === 0
            ? 0
            : (safePage - 1) * pageSize + 1;

    const endItem = Math.min(
        safePage * pageSize,
        totalItems
    );

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                    {startItem}
                </span>
                {" "}to{" "}
                <span className="font-medium text-slate-700">
                    {endItem}
                </span>
                {" "}of{" "}
                <span className="font-medium text-slate-700">
                    {totalItems}
                </span>
                {" "}results
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() =>
                        setPage((previous) =>
                            Math.max(1, previous - 1)
                        )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={15} />
                    Previous
                </button>

                <span className="whitespace-nowrap text-xs text-slate-500">
                    Page {safePage} of {totalPages}
                </span>

                <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                        setPage((previous) =>
                            Math.min(totalPages, previous + 1)
                        )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
