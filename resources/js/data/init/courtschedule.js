import { Clock3, CheckCircle2, CalendarCheck2, Ban } from "lucide-react";

export const courtScheduleStats = [
    {
        key: "total",
        label: "Total Slots",
        icon: Clock3,
        color: "text-slate-700",
        bg: "bg-slate-100",
    },
    {
        key: "available",
        label: "Available",
        icon: CheckCircle2,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
    },
    {
        key: "booked",
        label: "Booked",
        icon: CalendarCheck2,
        color: "text-red-700",
        bg: "bg-red-50",
    },
    {
        key: "unavailable",
        label: "Unavailable / Past",
        icon: Ban,
        color: "text-amber-700",
        bg: "bg-amber-50",
    },
];
