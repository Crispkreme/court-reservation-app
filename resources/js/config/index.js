export const statusConfig = {
    available: {
        label: "Available",
        styles: "bg-green-100 text-green-700",
    },
    maintenance: {
        label: "Maintenance",
        styles: "bg-amber-100 text-amber-700",
    },
    closed: {
        label: "Closed",
        styles: "bg-red-100 text-red-700",
    },
    temporarily_blocked: {
        label: "Temporarily Blocked",
        styles: "bg-slate-100 text-slate-700",
    },
};

export const courtStatusOptions = [
    { label: "All Statuses", value: "" },
    ...Object.entries(statusConfig).map(([value, config]) => ({
        label: config.label,
        value,
    })),
];
