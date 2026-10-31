import { getStatusClass } from "../enums/enum";

export default function StatusBadge({ status, active }) {
    const resolvedStatus =
        typeof active === "boolean"
            ? active
                ? "ACTIVE"
                : "INACTIVE"
            : status;

    const normalized = String(
        resolvedStatus || "UNKNOWN"
    ).toUpperCase();

    const classes = getStatusClass(normalized);

    const label = normalized.replaceAll("_", " ").toLowerCase();

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${classes}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}