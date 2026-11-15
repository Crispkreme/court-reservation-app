import { BadgeCheck, Wrench, Ban, LockKeyhole } from "lucide-react";

export const initialForm = {
    sport_category_id: "",
    name: "",
    description: "",
    location: "",
    court_type: "indoor",
    min_players: "1",
    max_players: "10",
    price_per_hour: "",
    booking_interval_minutes: "30",
    min_booking_minutes: "60",
    max_booking_minutes: "180",
    opening_time: "08:00",
    closing_time: "22:00",
    status: "available",
};

export const typeOptions = [
    { label: "Indoor", value: "indoor" },
    { label: "Outdoor", value: "outdoor" },
];

export const bookingIntervalOptions = [
    { label: "15 Minutes", value: "15" },
    { label: "30 Minutes", value: "30" },
    { label: "60 Minutes", value: "60" },
];

export const statusConfig = {
    available: {
        label: "Available",
        styles: "bg-green-100 text-green-700",
        icon: BadgeCheck,
        message: "Online reservations will be enabled once the booking module is implemented.",
    },

    maintenance: {
        label: "Maintenance",
        styles: "bg-amber-100 text-amber-700",
        icon: Wrench,
        message: "This court is currently under maintenance and cannot be booked.",
    },

    closed: {
        label: "Closed",
        styles: "bg-red-100 text-red-700",
        icon: Ban,
        message: "This court is currently closed and cannot be booked.",
    },

    temporarily_blocked: {
        label: "Temporarily Blocked",
        styles: "bg-slate-100 text-slate-700",
        icon: LockKeyhole,
        message: "This court is temporarily blocked and cannot be booked.",
    },
};

export const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
    label: config.label,
    value,
}));

export const operatingOptions = [
    { label: "Open Now", value: "open" },
    { label: "Closed Now", value: "closed" },
];