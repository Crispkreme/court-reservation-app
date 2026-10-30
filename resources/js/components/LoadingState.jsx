import { RefreshCw } from "lucide-react";

export default function LoadingState({
    message = "Loading...",
    className = "",
}) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`p-10 text-center text-sm text-slate-500 ${className}`}
        >
            <RefreshCw
                size={22}
                className="mx-auto mb-3 animate-spin text-blue-600"
            />

            {message}
        </div>
    );
}