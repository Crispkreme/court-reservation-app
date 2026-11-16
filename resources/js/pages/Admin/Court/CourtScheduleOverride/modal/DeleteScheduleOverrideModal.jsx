
import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { deleteScheduleOverride } from "@services/courtScheduleOverrideService";

const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = String(date).slice(0, 10).split("-");

    if (!year || !month || !day) return "—";

    return `${day}/${month}/${year}`;
};

export default function DeleteScheduleOverrideModal({
    open = false,
    schedule = null,
    onClose,
    onSuccess,
}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    if (!open || !schedule) return null;

    const courtName =
        schedule.court?.name || `Court ${schedule.court_id}`;

    const handleClose = () => {
        if (deleting) return;

        setError("");
        onClose?.();
    };

    const handleDelete = async () => {
        if (deleting || !schedule?.id) return;

        setDeleting(true);
        setError("");

        try {
            await deleteScheduleOverride(schedule.id);
            onSuccess?.();
            onClose?.();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to delete schedule override. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-schedule-title"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                            <AlertTriangle
                                size={24}
                                className="text-red-700"
                            />
                        </div>

                        <div>
                            <h2
                                id="delete-schedule-title"
                                className="text-lg font-bold text-gray-900"
                            >
                                Delete Schedule Override?
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={deleting}
                        aria-label="Close modal"
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-5 space-y-3">
                    <p className="text-sm leading-6 text-gray-600">
                        Are you sure you want to remove the schedule override for{" "}
                        <span className="font-semibold text-gray-900">
                            {courtName}
                        </span>{" "}
                        on{" "}
                        <span className="font-semibold text-gray-900">
                            {formatDate(schedule.date)}
                        </span>
                        ?
                    </p>

                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm leading-6 text-amber-800">
                            The court will return to its recurring schedule
                            or default operating hours for this date.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={deleting}
                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {deleting && (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {deleting ? "Deleting..." : "Delete Override"}
                    </button>
                </div>
            </div>
        </div>
    );
} 