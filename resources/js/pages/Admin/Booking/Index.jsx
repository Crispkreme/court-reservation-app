
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Plus,
    RefreshCw,
    Search,
    XCircle,
} from "lucide-react";

import {
    getBookings,
    updateBookingStatus,
} from "@/services/bookingService";
import { getCourts } from "@/services/courtService";

import { bookingColumns } from "@data/tableColumns/bookingColumns";
import BookingModal from "./modal/BookingModal";
import DeleteBookingModal from "./modal/DeleteBookingModal";

const normalizeCollection = (response) => {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
};

export default function BookingIndex() {
    const [bookings, setBookings] = useState([]);
    const [courts, setCourts] = useState([]);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [courtFilter, setCourtFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [deleteBookingItem, setDeleteBookingItem] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const loadBookings = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getBookings({
                page: currentPage,
                per_page: perPage,
                court_id: courtFilter || undefined,
                status: statusFilter || undefined,
            });

            const payload = response?.data ?? response;
            const rows = normalizeCollection(response);

            setBookings(rows);
            setTotalItems(
                payload?.total ??
                    payload?.meta?.total ??
                    rows.length,
            );
        } catch (error) {
            setError(
                error.response?.data?.message ??
                    "Unable to load bookings.",
            );
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, courtFilter, statusFilter]);

    const loadCourts = useCallback(async () => {
        try {
            const response = await getCourts();
            setCourts(normalizeCollection(response));
        } catch {
            setCourts([]);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    const filteredBookings = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return bookings;

        return bookings.filter((booking) =>
            [
                booking.id,
                booking.court?.name,
                booking.user?.name,
                booking.user?.email,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(keyword),
                ),
        );
    }, [bookings, search]);

    const stats = useMemo(
        () => ({
            total: totalItems,
            pending: bookings.filter(
                (booking) => booking.status === "pending",
            ).length,
            confirmed: bookings.filter(
                (booking) => booking.status === "confirmed",
            ).length,
            completed: bookings.filter(
                (booking) => booking.status === "completed",
            ).length,
            cancelled: bookings.filter(
                (booking) => booking.status === "cancelled",
            ).length,
        }),
        [bookings, totalItems],
    );

    const handleStatusChange = async (booking, status) => {
        if (booking.status === status) return;

        setUpdatingStatusId(booking.id);
        setError("");

        try {
            await updateBookingStatus(booking.id, status);
            await loadBookings();
        } catch (error) {
            setError(
                error.response?.data?.message ??
                    "Unable to update booking status.",
            );
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const columns = useMemo(
        () =>
            bookingColumns({
                onEdit: (booking) => {
                    setSelectedBooking(booking);
                    setModalOpen(true);
                },
                onDelete: setDeleteBookingItem,
                onStatusChange: handleStatusChange,
                updatingStatusId,
            }),
        [updatingStatusId],
    );

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / perPage),
    );

    const openCreateModal = () => {
        setSelectedBooking(null);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Booking Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage court reservations and booking statuses.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadBookings}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                    >
                        <Plus size={16} />
                        Add Booking
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {[
                    {
                        label: "Total Bookings",
                        value: stats.total,
                        icon: CalendarDays,
                    },
                    {
                        label: "Pending",
                        value: stats.pending,
                        icon: Clock3,
                    },
                    {
                        label: "Confirmed",
                        value: stats.confirmed,
                        icon: CheckCircle2,
                    },
                    {
                        label: "Completed",
                        value: stats.completed,
                        icon: CheckCircle2,
                    },
                    {
                        label: "Cancelled",
                        value: stats.cancelled,
                        icon: XCircle,
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                            <stat.icon size={20} />
                        </div>
                        <p className="text-sm text-gray-500">
                            {stat.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                    <div className="relative min-w-48 flex-1">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    <select
                        value={courtFilter}
                        onChange={(event) => {
                            setCourtFilter(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    >
                        <option value="">All Courts</option>
                        {courts.map((court) => (
                            <option key={court.id} value={court.id}>
                                {court.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {error && (
                    <div className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="whitespace-nowrap px-4 py-3 font-semibold"
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        Loading bookings...
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-gray-50"
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="whitespace-nowrap px-4 py-4 text-gray-700"
                                            >
                                                {column.render(booking)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4">
                    <p className="text-sm text-gray-500">
                        Showing {filteredBookings.length} of{" "}
                        {totalItems} bookings
                    </p>

                    <div className="flex items-center gap-3">
                        <select
                            value={perPage}
                            onChange={(event) => {
                                setPerPage(Number(event.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        >
                            {[10, 20, 30, 40, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() =>
                                setCurrentPage((page) => page - 1)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-gray-600">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                                setCurrentPage((page) => page + 1)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <BookingModal
                open={modalOpen}
                booking={selectedBooking}
                courts={courts}
                members={members}
                onClose={() => setModalOpen(false)}
                onSuccess={loadBookings}
            />

            <DeleteBookingModal
                booking={deleteBookingItem}
                onClose={() => setDeleteBookingItem(null)}
                onSuccess={loadBookings}
            />
        </div>
    );
}
