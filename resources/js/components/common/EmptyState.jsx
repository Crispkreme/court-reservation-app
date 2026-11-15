
import { Inbox } from "lucide-react";

export default function EmptyState({
    icon: Icon = Inbox,
    title = "No data found",
    description = "There are no records to display.",
    buttonText = "",
    onButtonClick,
    showButton = false,
    className = "",
}) {
    return (
        <div
            className={`
                rounded-2xl border border-slate-200
                bg-white px-6 py-16 text-center
                ${className}
            `}
        >
            {/* Icon */}
            {Icon && (
                <Icon
                    size={42}
                    className="mx-auto mb-4 text-slate-300"
                />
            )}

            {/* Title */}
            <h3 className="font-semibold text-slate-900">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="mt-2 text-sm text-slate-500">
                    {description}
                </p>
            )}

            {/* Optional Action Button */}
            {showButton && onButtonClick && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    className="
                        mt-4 text-sm font-semibold
                        text-red-700 transition
                        hover:text-red-800 hover:underline
                        focus:outline-none focus:ring-2
                        focus:ring-red-200
                        rounded-md
                    "
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
}
