import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

import FormInput from "@components/common/FormInput";
import FormSelect from "@components/common/FormSelect";

export default function FilterPanel({
    title = "Search & Filter",
    search = "",
    onSearchChange,
    searchLabel = "",
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

    const getFilterOptions = (filter) => {
        const options = filter.options || [];

        if (filter.includeDefault === false) {
            return options;
        }

        const defaultValue = filter.defaultValue ?? "";
        const defaultLabel = filter.placeholder || "All";

        if (
            options.some(
                (option) => String(option.value) === String(defaultValue)
            )
        ) {
            return options;
        }

        return [
            {
                value: defaultValue,
                label: defaultLabel,
            },
            ...options,
        ];
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                        disabled={loading}
                        className="!inline-flex !flex-row !items-center !justify-center !gap-2 !w-auto !rounded-lg !border !border-red-600 !bg-white !px-4 !py-2 !text-sm !font-semibold !text-red-700 !whitespace-nowrap hover:!bg-red-50 disabled:!cursor-not-allowed disabled:!opacity-50"
                    >
                        <RotateCcw size={16} className="shrink-0" />
                        <span className="whitespace-nowrap">Clear Filters</span>
                    </button>
                )}
            </div>

            <div
                className={`grid grid-cols-1 gap-3 ${
                    gridColumns[columns] || gridColumns[3]
                }`}
            >
                {onSearchChange && (
                    <FormInput
                        type="search"
                        name="search"
                        label={searchLabel}
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder={searchPlaceholder}
                        icon={Search}
                        disabled={loading}
                    />
                )}

                {filters.map((filter) => {
                    const {
                        name,
                        type = "select",
                        label,
                        value = "",
                        onChange,
                        placeholder,
                        disabled = false,
                        required = false,
                        error,
                    } = filter;

                    if (type === "date") {
                        return (
                            <FormInput
                                key={name}
                                type="date"
                                name={name}
                                label={label}
                                value={value ?? ""}
                                onChange={(event) =>
                                    onChange?.(event.target.value)
                                }
                                min={filter.min}
                                max={filter.max}
                                required={required}
                                disabled={disabled || loading}
                                error={error}
                            />
                        );
                    }

                    return (
                        <FormSelect
                            key={name}
                            name={name}
                            label={label}
                            value={value ?? ""}
                            onChange={(event) =>
                                onChange?.(event.target.value)
                            }
                            placeholder={placeholder || "All"}
                            options={getFilterOptions(filter)}
                            required={required}
                            disabled={disabled || loading}
                            error={error}
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