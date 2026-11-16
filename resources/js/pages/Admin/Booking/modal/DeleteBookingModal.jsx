
import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { deleteBooking } from "@/services/bookingService";

export default function DeleteBookingModal({
    booking,
    onClose,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!booking) return null;

    const handleDelete = async () => {
        setLoading(true);
        setError("");

        try {
            await deleteBooking(booking.id);
            onSuccess?.();
            onClose?.();
        } catch (error) {
            setError(
                error.response?.data?.message ??
                    "Unable to delete this booking.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <AlertTriangle size={24} />
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <h2 className="text-lg font-bold text-gray-900">
                    Delete Booking?
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to permanently delete booking{" "}
                    <span className="font-semibold">
                        #{booking.id}
                    </span>
                    ? This action cannot be undone.
                </p>

                {error && (
                    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}
