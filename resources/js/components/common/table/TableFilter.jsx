
import { Search } from "lucide-react";

export default function TableFilter({
    search = "",
    onSearchChange,
    searchPlaceholder = "Search records...",
    status = "",
    onStatusChange,
    statusOptions = [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ],
    className = "",
}) {
    return (
        <div
            className={`
                flex flex-col gap-3
                border-b border-gray-100
                bg-white p-4 sm:flex-row
                ${className}
            `}
        >
            {/* Search */}
            <div className="relative flex-1">
                <Search
                    size={18}
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute
                        left-3 top-1/2 -translate-y-1/2
                        text-gray-400
                    "
                />

                <input
                    type="search"
                    value={search}
                    onChange={(e) =>
                        onSearchChange?.(e.target.value)
                    }
                    placeholder={searchPlaceholder}
                    aria-label="Search records"
                    className="
                        w-full rounded-xl
                        border border-gray-200
                        bg-white py-2.5 pl-10 pr-4
                        text-sm text-gray-800
                        outline-none transition
                        focus:border-red-500
                        focus:ring-2 focus:ring-red-100
                    "
                />
            </div>

            {/* Status Filter */}
            <select
                value={status}
                onChange={(e) =>
                    onStatusChange?.(e.target.value)
                }
                aria-label="Filter records by status"
                className="
                    w-full rounded-xl
                    border border-gray-200
                    bg-white px-4 py-2.5
                    text-sm text-gray-700
                    outline-none transition
                    focus:border-red-500
                    focus:ring-2 focus:ring-red-100
                    sm:w-48
                "
            >
                {statusOptions.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
