import { Plus } from "lucide-react";

export default function EmptyState({
    icon: Icon = Plus,
    title = "No records found",
    message,
    description,
    className = "",
}) {
    return (
        <div
            className={`flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center ${className}`}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Icon size={28} strokeWidth={1.6} />
            </div>

            <p className="mt-4 font-medium text-slate-800">
                {title}
            </p>

            {(description || message) && (
                <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
                    {description || message}
                </p>
            )}
        </div>
    );
}