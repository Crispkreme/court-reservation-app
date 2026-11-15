
export const TIME_ZONE = "Asia/Dubai";
export const BOOKING_INTERVALS = [15, 30, 60];

const MAX_BOOKING_MINUTES = 1440;

export const numeric = (value) => {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
};

export const getCurrentUaeTime = () => {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(new Date());
};

export const startUaeTimeUpdates = (
    setCurrentTime,
    intervalMs = 30000
) => {
    const updateCurrentTime = () => {
        setCurrentTime(getCurrentUaeTime());
    };

    updateCurrentTime();

    const interval = setInterval(
        updateCurrentTime,
        intervalMs
    );

    return () => clearInterval(interval);
};

export const formatMoney = (amount) => {
    return numeric(amount).toLocaleString("en-AE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const formatPrice = (price) => {
    return formatMoney(price);
};

export const isValidTime = (time) => {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time ?? "");
};

export const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const formatTime = (time) => {
    if (!time) return "—";

    const match = String(time).match(
        /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/
    );

    if (!match) return "—";

    const hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes} ${period}`;
};

export const formatOperatingTime = (time) => {
    return formatTime(time);
};

export const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || minutes === "") {
        return "—";
    }

    const value = Number(minutes);

    if (!Number.isInteger(value) || value <= 0) {
        return "—";
    }

    const hours = Math.floor(value / 60);
    const remainingMinutes = value % 60;

    if (hours === 0) {
        return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    }

    return `${hours} ${hours === 1 ? "hr" : "hrs"} ${remainingMinutes} min`;
};

export const hasValidBookingConfiguration = (court) => {
    if (!court || typeof court !== "object") {
        return false;
    }

    const interval = Number(court.booking_interval_minutes);
    const minimum = Number(court.min_booking_minutes);
    const maximum = Number(court.max_booking_minutes);

    return (
        BOOKING_INTERVALS.includes(interval) &&
        Number.isInteger(minimum) &&
        Number.isInteger(maximum) &&
        minimum >= 15 &&
        maximum <= MAX_BOOKING_MINUTES &&
        maximum >= minimum &&
        minimum % interval === 0 &&
        maximum % interval === 0
    );
};

export const getAllowedBookingDurations = (court) => {
    if (!hasValidBookingConfiguration(court)) {
        return [];
    }

    const interval = Number(court.booking_interval_minutes);
    const minimum = Number(court.min_booking_minutes);
    const maximum = Number(court.max_booking_minutes);
    const durations = [];

    for (
        let duration = minimum;
        duration <= maximum;
        duration += interval
    ) {
        durations.push(duration);
    }

    return durations;
};

export const getBookingDurations = (court) => {
    return getAllowedBookingDurations(court);
};

export const calculateBookingPrice = (
    pricePerHour,
    durationMinutes
) => {
    const price = Number(pricePerHour);
    const duration = Number(durationMinutes);

    if (
        pricePerHour === null ||
        pricePerHour === undefined ||
        pricePerHour === "" ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(duration) ||
        duration <= 0
    ) {
        return 0;
    }

    const total = price * (duration / 60);

    return Math.round((total + Number.EPSILON) * 100) / 100;
};

export const calculatePrice = (hourlyRate, minutes) => {
    if (
        hourlyRate === null ||
        hourlyRate === undefined ||
        hourlyRate === ""
    ) {
        return null;
    }

    const rate = Number(hourlyRate);
    const duration = Number(minutes);

    if (
        !Number.isFinite(rate) ||
        rate < 0 ||
        !Number.isInteger(duration) ||
        duration <= 0
    ) {
        return null;
    }

    return (
        Math.round(rate * 100) *
        duration /
        60 /
        100
    ).toFixed(2);
};

export const getOperatingStatus = (
    court,
    currentTime = getCurrentUaeTime()
) => {
    if (!court || court.status !== "available") {
        return {
            key: "unavailable",
            label: "Unavailable",
            styles: "bg-slate-100 text-slate-600",
            message: "This court is currently unavailable for booking.",
        };
    }

    const openingTime = String(court.opening_time ?? "").slice(0, 5);
    const closingTime = String(court.closing_time ?? "").slice(0, 5);

    if (
        !isValidTime(openingTime) ||
        !isValidTime(closingTime) ||
        closingTime <= openingTime
    ) {
        return {
            key: "unknown",
            label: "Hours Unavailable",
            styles: "bg-gray-100 text-gray-600",
            message: "Operating hours are not currently available.",
        };
    }

    if (!isValidTime(currentTime)) {
        return {
            key: "unknown",
            label: "Checking Hours",
            styles: "bg-gray-100 text-gray-600",
            message: "Checking the current operating hours.",
        };
    }

    const isOpen =
        currentTime >= openingTime &&
        currentTime < closingTime;

    if (isOpen) {
        return {
            key: "open",
            label: "Open Now",
            styles: "bg-emerald-100 text-emerald-700",
            message: "This court is currently within its operating hours.",
        };
    }

    return {
        key: "closed",
        label: "Closed Now",
        styles: "bg-gray-100 text-gray-600",
        message: "This court is currently outside its operating hours.",
    };
};

export const toLocalInput = (value) => {
    if (!value) return "";

    const normalized = String(value).trim().replace(" ", "T");

    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);

    const date = new Date(
        hasTimezone ? normalized : `${normalized}Z`
    );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const get = (type) => {
        return parts.find((part) => part.type === type)?.value ?? "";
    };

    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export const toUtc = (value) => {
    if (!value) return "";

    const normalized = String(value).trim();

    if (
        !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(normalized)
    ) {
        return "";
    }

    const date = new Date(`${normalized}:00+04:00`);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const converted = toLocalInput(date.toISOString());

    if (converted !== normalized) {
        return "";
    }

    return date.toISOString();
};


export const formatDateTime = (value) => {
    const local = toLocalInput(value);

    if (!local) return "—";

    const [date, time] = local.split("T");

    return `${date} ${time}`;
};
