import React from "react";

export default function CancelBookingModal({ booking, loading, onClose, onConfirm }) {
    if (!booking) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 id="cancel-booking-title" className="text-lg font-bold text-gray-900">Cancel reservation?</h2>
                <p className="mt-2 text-sm text-gray-600">Are you sure you want to cancel booking #{booking.id}? This action cannot be undone from the Member portal.</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" disabled={loading} onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium">Keep booking</button>
                    <button type="button" disabled={loading} onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Cancelling..." : "Cancel booking"}</button>
                </div>
            </div>
        </div>
    );
}
