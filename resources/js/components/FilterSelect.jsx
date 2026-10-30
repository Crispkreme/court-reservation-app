export default function FilterSelect({
    label,
    value,
    onChange,
    children,
    className = "",
    disabled = false,
}) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
                {label}
            </span>

            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
            >
                {children}
            </select>
        </label>
    );
}