import {
    LayoutDashboard,
    CalendarClock,
    ChartNoAxesColumn,
    CalendarDays,
    CalendarCheck,
    Clock3,
    Users,
    UserRound,
    Wrench,
    Tags,
    LayoutGrid,
} from "lucide-react";

export const adminMenu = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "dashboard",
        end: true,
    },
    {
        label: "Sport Categories",
        icon: Tags,
        path: "sport-categories",
        end: true,
    },
    {
        label: "Court Management",
        icon: LayoutGrid,
        path: "courts",
        end: true,
    },
    {
        label: "Court Maintenance",
        icon: Wrench,
        path: "court-maintenance",
        end: true,
    },
    {
        label: "Court Schedules",
        icon: Clock3,
        path: "court-schedules",
        end: true,
    },
    {
        label: "Court Utilization",
        icon: ChartNoAxesColumn,
        path: "court-utilization",
        end: true,
    },
    {
        label: "Recurring Schedules",
        path: "court-recurring-schedules",
        icon: CalendarClock,
        end: true,
    },
    {
        label: "Schedule Overrides",
        path: "court-schedule-overrides",
        icon: CalendarClock,
        end: true,
    },
    {
        label: "Reservations",
        icon: CalendarCheck,
        path: "bookings",
        end: true,
    },
    {
        label: "Manage Members",
        icon: Users,
        path: "members",
        enabled: false,
    },
    {
        label: "My Account",
        icon: UserRound,
        path: "account",
        end: true,
    },
];

export const memberMenu = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "dashboard",
        end: true,
    },
    {
        label: "Browse Courts",
        icon: LayoutGrid,
        path: "courts",
        end: true,
    },
    {
        label: "Court Schedules",
        icon: CalendarDays,
        path: "court-schedules",
        end: true,
    },
    {
        label: "Court Utilization",
        icon: ChartNoAxesColumn,
        path: "courts/utilization",
        end: true,
    },
    {
        label: "My Booking",
        icon: CalendarCheck,
        path: "bookings",
        end: true,
    },
    {
        label: "My Account",
        icon: UserRound,
        path: "account",
        end: true,
    },
];
