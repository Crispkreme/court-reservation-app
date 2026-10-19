
/**
 * Format a number as Philippine Peso.
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(value || 0));
};

/**
 * Format a date in a readable Philippine format.
 * Example: October 19, 2026
 */
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

/**
 * Format a 24-hour time as a 12-hour Philippine time.
 */
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
