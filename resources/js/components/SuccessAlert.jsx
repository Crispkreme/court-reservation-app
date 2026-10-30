import { CheckCircle2 } from "lucide-react";

export default function SuccessAlert({ message, className = "" }) {
    if (!message) return null;

    return (
        <div
            role="status"
            className={`flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 ${className}`}
        >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}