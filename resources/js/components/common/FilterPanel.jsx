
import { Search, SlidersHorizontal } from "lucide-react";

import FormInput from "@components/common/FormInput";
import FormSelect from "@components/common/FormSelect";

export default function FilterPanel({
    title = "Search & Filter",
    search = "",
    onSearchChange,
    searchPlaceholder = "Search...",
    filters = [],
    onClear,
    showClear = true,
    columns = 3,
    className = "",
    onApply,
    applyDisabled = false,
    loading = false,
}) {
    const gridColumns = {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4",
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onApply?.();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal
                        size={18}
                        className="text-red-700"
                    />

                    <h2 className="font-semibold text-slate-900">
                        {title}
                    </h2>
                </div>

                {showClear && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs font-semibold text-red-700 transition hover:underline"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div
                className={`grid grid-cols-1 gap-3 ${gridColumns[columns] || gridColumns[3]}`}
            >
                {onSearchChange && (
                    <FormInput
                        type="search"
                        name="search"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder={searchPlaceholder}
                        icon={Search}
                    />
                )}

                {filters.map((filter) => {
                    if (filter.type === "date") {
                        return (
                            <FormInput
                                key={filter.name}
                                type="date"
                                name={filter.name}
                                label={filter.label}
                                value={filter.value ?? ""}
                                onChange={(event) =>
                                    filter.onChange(event.target.value)
                                }
                                min={filter.min}
                                max={filter.max}
                                required={filter.required}
                                disabled={filter.disabled || loading}
                                error={filter.error}
                            />
                        );
                    }

                    return (
                        <FormSelect
                            key={filter.name}
                            name={filter.name}
                            label={filter.label}
                            value={filter.value ?? ""}
                            onChange={(event) =>
                                filter.onChange(event.target.value)
                            }
                            placeholder={filter.placeholder || "All"}
                            options={[
                                {
                                    value: "",
                                    label: filter.placeholder || "All",
                                },
                                ...(filter.options || []),
                            ]}
                            disabled={filter.disabled || loading}
                        />
                    );
                })}
            </div>

            {onApply && (
                <div className="mt-5 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || applyDisabled}
                        className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Apply Filters"}
                    </button>
                </div>
            )}
        </form>
    );
}
