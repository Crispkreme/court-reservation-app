import { Clock3, CheckCircle2, CalendarCheck2, Hourglass, Ban, Wrench, LockKeyhole } from "lucide-react";

export const courtScheduleStats = [
    {
        key: "total",
        label: "Total Slots",
        icon: Clock3,
        color: "text-slate-700",
    },
    {
        key: "available",
        label: "Available",
        icon: CheckCircle2,
        color: "text-emerald-700",
    },
    {
        key: "reserved",
        label: "Reserved",
        icon: CalendarCheck2,
        color: "text-red-700",
    },
    {
        key: "held",
        label: "Held",
        icon: Hourglass,
        color: "text-amber-700",
    },
    {
        key: "blocked",
        label: "Blocked",
        icon: Ban,
        color: "text-slate-700",
    },
    {
        key: "maintenance",
        label: "Maintenance",
        icon: Wrench,
        color: "text-blue-700",
    },
    {
        key: "closed",
        label: "Closed",
        icon: LockKeyhole,
        color: "text-gray-600",
    },
];
