
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";

const variants = {
    success: {
        container: "border-green-200 bg-green-50 text-green-700",
        hover: "hover:bg-green-100",
        icon: CheckCircle2,
    },
    error: {
        container: "border-red-200 bg-red-50 text-red-700",
        hover: "hover:bg-red-100",
        icon: AlertCircle,
    },
    warning: {
        container: "border-amber-200 bg-amber-50 text-amber-700",
        hover: "hover:bg-amber-100",
        icon: AlertTriangle,
    },
    info: {
        container: "border-red-200 bg-red-50 text-red-800",
        hover: "hover:bg-red-100",
        icon: Info,
    },
};

export default function AlertMessage({
    message,
    type = "success",
    onClose,
    dismissible = true,
    showIcon = true,
    className = "",
}) {
    if (!message) return null;

    const variant = variants[type] || variants.success;
    const Icon = variant.icon;

    return (
        <div
            role={type === "error" ? "alert" : "status"}
            className={`
                mb-5 flex items-center justify-between gap-3
                rounded-xl border px-4 py-3 text-sm
                ${variant.container}
                ${className}
            `}
        >
            <div className="flex min-w-0 items-center gap-3">
                {showIcon && (
                    <Icon
                        size={19}
                        className="shrink-0"
                        aria-hidden="true"
                    />
                )}

                <span className="min-w-0 break-words">
                    {message}
                </span>
            </div>

            {dismissible && onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss message"
                    className={`
                        shrink-0 rounded-lg p-1
                        transition-colors duration-200
                        ${variant.hover}
                    `}
                >
                    <X size={17} />
                </button>
            )}
        </div>
    );
}
