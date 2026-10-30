export const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(value || 0));
};

export const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const formatTime = (value) => {
    if (!value) {
        return "-";
    }

    const [hours, minutes] = value.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-PH", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
    });
};

export const calculateDuration = (start, end) => {
    if (!start || !end) {
        return 0;
    }

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes > startMinutes
        ? endMinutes - startMinutes
        : 0;
};

export const calculateTotalAmount = (duration, unitPrice) => {
    return (Number(duration || 0) / 60) * Number(unitPrice || 0);
};

export const getTodayDate = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};