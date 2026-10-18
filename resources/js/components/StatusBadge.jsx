
export default function StatusBadge({ status }) {
    const normalized = String(
        status || "unknown"
    ).toLowerCase();

    let classes = "bg-gray-100 text-gray-700";

    if (
        [
            "confirmed",
            "paid",
            "completed",
            "active",
            "available",
            "success",
            "successful",
        ].includes(normalized)
    ) {
        classes = "bg-green-100 text-green-700";
    } else if (
        [
            "pending",
            "held",
            "reserved",
            "processing",
            "waiting",
        ].includes(normalized)
    ) {
        classes = "bg-yellow-100 text-yellow-700";
    } else if (
        [
            "cancelled",
            "failed",
            "expired",
            "closed",
            "maintenance",
            "no_show",
        ].includes(normalized)
    ) {
        classes = "bg-red-100 text-red-700";
    }

    const label = String(status || "Unknown")
        .replaceAll("_", " ");

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
        >
            {label}
        </span>
    );
}
