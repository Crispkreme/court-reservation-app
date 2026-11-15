
import { Plus } from "lucide-react";

export default function PageHeader({
    title,
    description = "",
    buttonText = "",
    buttonIcon: ButtonIcon = Plus,
    onButtonClick,
    showButton = false,
    buttonVariant = "primary",
    buttonDisabled = false,
    buttonLoading = false,
    className = "",
}) {
    const buttonVariants = {
        primary:
            "bg-red-700 text-white hover:bg-red-800 focus:ring-red-100",

        secondary:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-100",
    };

    return (
        <div
            className={`
                mb-7 flex flex-col justify-between gap-4
                sm:flex-row sm:items-center
                ${className}
            `}
        >
            {/* Title and Description */}
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {title}
                </h1>

                {description && (
                    <p className="mt-2 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>

            {/* Optional Action Button */}
            {showButton && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    disabled={buttonDisabled || buttonLoading}
                    className={`
                        inline-flex shrink-0 items-center justify-center
                        gap-2 rounded-xl px-5 py-3
                        text-sm font-semibold
                        transition-colors duration-200
                        focus:outline-none focus:ring-4
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        ${buttonVariants[buttonVariant] ?? buttonVariants.primary}
                    `}
                >
                    {ButtonIcon && (
                        <ButtonIcon
                            size={19}
                            className={
                                buttonLoading ? "animate-spin" : ""
                            }
                        />
                    )}

                    {buttonText}
                </button>
            )}
        </div>
    );
}
