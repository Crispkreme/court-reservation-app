import { AlertCircle } from "lucide-react";

export default function ErrorAlert({ message, className = "" }) {
    if (!message) return null;

    return (
        <div
            role="alert"
            className={`flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${className}`}
        >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}