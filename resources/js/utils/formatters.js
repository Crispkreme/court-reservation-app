
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
 * Format a date for display.
 */
export const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-PH");
};

/**
 * Format a 24-hour time as a 12-hour time.
 */
export const formatTime = (value) => {
    if (!value) {
        return "-";
    }

    const [hours, minutes] = value.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
    });
};
