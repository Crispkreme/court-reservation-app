import { useEffect, useState } from 'react';

const DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const STATUSES = [
    'available',
    'blocked',
    'maintenance',
    'closed',
];

export default function CourtSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedCourt, setSelectedCourt] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const [form, setForm] = useState({
        court_id: '',
        day_of_week: 1,
        start_time: '08:00',
        end_time: '22:00',
        status: 'available',
        start_date: '',
        end_date: '',
        is_active: true,
        notes: '',
    });

    useEffect(() => {
        fetchCourts();
        fetchSchedules();
    }, []);

    const fetchCourts = async () => {
        try {
            const response = await fetch('/api/v1/courts', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load courts');
            }

            const data = await response.json();

            setCourts(data.data ?? data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (selectedCourt) {
                params.append('court_id', selectedCourt);
            }

            if (selectedStatus) {
                params.append('status', selectedStatus);
            }

            const url = `/api/v1/court-schedules${
                params.toString() ? `?${params}` : ''
            }`;

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load schedules');
            }

            const data = await response.json();

            setSchedules(data.data ?? data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [selectedCourt, selectedStatus]);

    const resetForm = () => {
        setForm({
            court_id: courts[0]?.id ?? '',
            day_of_week: 1,
            start_time: '08:00',
            end_time: '22:00',
            status: 'available',
            start_date: '',
            end_date: '',
            is_active: true,
            notes: '',
        });
    };

    const openCreateModal = () => {
        setEditingSchedule(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);

        setForm({
            court_id: schedule.court_id ?? '',
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time?.substring(0, 5) ?? '08:00',
            end_time: schedule.end_time?.substring(0, 5) ?? '22:00',
            status: schedule.status ?? 'available',
            start_date: schedule.start_date ?? '',
            end_date: schedule.end_date ?? '',
            is_active: Boolean(schedule.is_active),
            notes: schedule.notes ?? '',
        });

        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const saveSchedule = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            const url = editingSchedule
                ? `/api/v1/court-schedules/${editingSchedule.id}`
                : '/api/v1/court-schedules';

            const method = editingSchedule ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ?? 'Failed to save schedule'
                );
            }

            setShowModal(false);
            fetchSchedules();
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteSchedule = async (id) => {
        if (!confirm('Delete this court schedule?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/court-schedules/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete schedule');
            }

            fetchSchedules();
        } catch (error) {
            alert(error.message);
        }
    };

    const getCourtName = (courtId) => {
        const court = courts.find(
            (item) => Number(item.id) === Number(courtId)
        );

        return court?.name ?? `Court #${courtId}`;
    };

    const getDayName = (day) => {
        return (
            DAYS.find(
                (item) => Number(item.value) === Number(day)
            )?.label ?? '-'
        );
    };

    const statusClasses = {
        available: 'bg-green-100 text-green-700',
        blocked: 'bg-red-100 text-red-700',
        maintenance: 'bg-orange-100 text-orange-700',
        closed: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Court Schedules
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage recurring weekly operating schedules for
                            your courts.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        + Add Schedule
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Court
                            </label>

                            <select
                                value={selectedCourt}
                                onChange={(e) =>
                                    setSelectedCourt(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Courts</option>

                                {courts.map((court) => (
                                    <option
                                        key={court.id}
                                        value={court.id}
                                    >
                                        {court.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>

                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSelectedCourt('');
                                    setSelectedStatus('');
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Court
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Day
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Operating Hours
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Active
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            Loading schedules...
                                        </td>
                                    </tr>
                                ) : schedules.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="text-gray-400">
                                                <div className="mb-2 text-4xl">
                                                    📅
                                                </div>

                                                <p className="font-medium text-gray-600">
                                                    No schedules found
                                                </p>

                                                <p className="mt-1 text-sm text-gray-400">
                                                    Create a recurring schedule
                                                    to get started.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => (
                                        <tr
                                            key={schedule.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {getCourtName(
                                                    schedule.court_id
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                {getDayName(
                                                    schedule.day_of_week
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                {schedule.start_time?.substring(
                                                    0,
                                                    5
                                                )}{' '}
                                                –{' '}
                                                {schedule.end_time?.substring(
                                                    0,
                                                    5
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        statusClasses[
                                                            schedule.status
                                                        ] ??
                                                        'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {schedule.status
                                                        ?.charAt(0)
                                                        .toUpperCase() +
                                                        schedule.status?.slice(
                                                            1
                                                        )}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {schedule.is_active ? (
                                                    <span className="font-medium text-green-600">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-gray-400">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(schedule)
                                                    }
                                                    className="mr-3 font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteSchedule(
                                                            schedule.id
                                                        )
                                                    }
                                                    className="font-medium text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingSchedule
                                        ? 'Edit Court Schedule'
                                        : 'Add Court Schedule'}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Configure recurring court availability.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={saveSchedule}
                            className="space-y-5 p-6"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Court
                                </label>

                                <select
                                    name="court_id"
                                    value={form.court_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">
                                        Select Court
                                    </option>

                                    {courts.map((court) => (
                                        <option
                                            key={court.id}
                                            value={court.id}
                                        >
                                            {court.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Day
                                </label>

                                <select
                                    name="day_of_week"
                                    value={form.day_of_week}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    {DAYS.map((day) => (
                                        <option
                                            key={day.value}
                                            value={day.value}
                                        >
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="start_time"
                                        value={form.start_time}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="end_time"
                                        value={form.end_time}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status
                                                .charAt(0)
                                                .toUpperCase() +
                                                status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    className="rounded"
                                />

                                Schedule is active
                            </label>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingSchedule
                                        ? 'Update Schedule'
                                        : 'Save Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}