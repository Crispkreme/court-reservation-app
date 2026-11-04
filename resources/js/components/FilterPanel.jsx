
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import FilterSelect from "./FilterSelect";

export default function FilterPanel({
    title = "Filters",
    search = "",
    setSearch,
    searchPlaceholder = "Search...",
    searchLabel = "Search",
    status = "",
    setStatus,
    statusLabel = "Status",
    statusOptions = [],
    onReset,
    showReset = true,
    children,
}) {
    return (
        <section className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            {/* Header */}
            <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal
                    size={17}
                    className="shrink-0 text-slate-500"
                />
                <h2 className="text-sm font-semibold text-slate-900">
                    {title}
                </h2>
            </div>

            {/* Responsive Filter Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Search */}
                {setSearch && (
                    <label className="block min-w-0">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">
                            {searchLabel}
                        </span>

                        <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                            <Search
                                size={17}
                                className="shrink-0 text-slate-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="h-full w-full min-w-0 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </label>
                )}

                {/* Status */}
                {setStatus && (
                    <FilterSelect
                        label={statusLabel}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="min-w-0"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                )}

                {/* Additional Filters */}
                {children}

            </div>

            {/* Footer */}
            {showReset && onReset && (
                <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:w-auto"
                    >
                        <RotateCcw size={14} />
                        Clear Filters
                    </button>
                </div>
            )}
        </section>
    );
}
