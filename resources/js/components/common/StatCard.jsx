
export default function StatCard({
    label,
    value,
    icon: Icon,
    className = "",
    iconClassName = "",
}) {
    return (
        <div
            className={`
                rounded-2xl border border-gray-200
                bg-white p-5 shadow-sm
                transition-all duration-200
                hover:border-red-200
                hover:shadow-md
                ${className}
            `}
        >
            <div className="flex items-center justify-between gap-3">
                {/* Label */}
                <p className="text-sm font-medium text-gray-500">
                    {label}
                </p>

                {/* Optional Icon */}
                {Icon && (
                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-red-50 p-2.5">
                        <Icon
                            size={21}
                            className={`text-red-700 ${iconClassName}`}
                        />
                    </div>
                )}
            </div>

            {/* Value */}
            <p className="mt-3 text-3xl font-bold text-red-800">
                {value ?? 0}
            </p>
        </div>
    );
}
