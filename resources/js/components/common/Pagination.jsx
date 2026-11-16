
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
    page = 1,
    lastPage = 1,
    total = 0,
    perPage = 6,
    onPageChange,
    loading = false,
    className = "",
}) {
    const currentPage = Math.min(Math.max(1, page), Math.max(1, lastPage));
    const totalPages = Math.max(1, lastPage);

    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);

    const pages = Array.from(
        { length: Math.min(5, totalPages) },
        (_, index) => {
            const first = Math.max(
                1,
                Math.min(currentPage - 2, totalPages - 4)
            );

            return first + index;
        }
    );

    return (
        <div
            className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${className}`}
        >
            <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                    {start}–{end}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                    {total}
                </span>{" "}
                results
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>

                {pages.map((number) => (
                    <button
                        key={number}
                        type="button"
                        disabled={loading}
                        onClick={() => onPageChange(number)}
                        aria-current={
                            currentPage === number ? "page" : undefined
                        }
                        className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                            currentPage === number
                                ? "bg-red-700 text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    type="button"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
