import React from "react";

const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-green-50 text-green-700 ring-green-200",
    completed: "bg-blue-50 text-blue-700 ring-blue-200",
    cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function BookingStatusBadge({ status }) {
    const value = String(status || "pending").toLowerCase();
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${styles[value] || styles.cancelled}`}>{value}</span>;
}
