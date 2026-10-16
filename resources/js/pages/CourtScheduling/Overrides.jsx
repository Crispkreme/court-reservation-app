import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Closed' },
    { value: 'holiday', label: 'Holiday' },
];

const statusClasses = {
    available: 'bg-green-100 text-green-700',
    blocked: 'bg-red-100 text-red-700',
    maintenance: 'bg-orange-100 text-orange-700',
    closed: 'bg-gray-100 text-gray-700',
    holiday: 'bg-purple-100 text-purple-700',
};

const emptyForm = {
    court_id: '',
    date: '',
    start_time: '',
    end_time: '',
    status: 'blocked',
    title: '',
    reason: '',
    is_active: true,
};

export default function CourtScheduleOverrides() {
    const [courts, setCourts] = useState([]);
    const [overrides, setOverrides] = useState([]);

    const [selectedCourt, setSelectedCourt] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingOverride, setEditingOverride] = useState(null);

    const [form, setForm] = useState(emptyForm);

    /*
    |--------------------------------------------------------------------------
    | Load Courts
    |--------------------------------------------------------------------------
    */

    const loadCourts = async () => {
        try {
            const response = await axios.get('/api/v1/courts');

            const data = response.data?.data ?? response.data ?? [];

            setCourts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load courts:', error);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Load Overrides
    |--------------------------------------------------------------------------
    */

    const loadOverrides = async () => {
        setLoading(true);

        try {
            const response = await axios.get(
                '/api/v1/court-schedule-overrides'
            );

            const data = response.data?.data ?? response.data ?? [];

            setOverrides(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load overrides:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourts();
        loadOverrides();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Filter Overrides
    |--------------------------------------------------------------------------
    */

    const filteredOverrides = useMemo(() => {
        return overrides.filter((override) => {
            const matchesCourt =
                selectedCourt === '' ||
                String(override.court_id) === String(selectedCourt);

            const matchesStatus =
                selectedStatus === '' ||
                String(override.status).toLowerCase() ===
                    String(selectedStatus).toLowerCase();

            return matchesCourt && matchesStatus;
        });
    }, [overrides, selectedCourt, selectedStatus]);

    /*
    |--------------------------------------------------------------------------
    | Form Helpers
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Open Add Modal
    |--------------------------------------------------------------------------
    */

    const openCreateModal = () => {
        setEditingOverride(null);

        setForm({
            ...emptyForm,
            court_id: courts.length > 0 ? courts[0].id : '',
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Open Edit Modal
    |--------------------------------------------------------------------------
    */

    const openEditModal = (override) => {
        setEditingOverride(override);

        setForm({
            court_id: override.court_id ?? '',
            date: override.date ?? '',
            start_time: override.start_time
                ? String(override.start_time).substring(0, 5)
                : '',
            end_time: override.end_time
                ? String(override.end_time).substring(0, 5)
                : '',
            status: override.status ?? 'blocked',
            title: override.title ?? '',
            reason: override.reason ?? '',
            is_active: Boolean(override.is_active),
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);

        try {
            const payload = {
                court_id: form.court_id,
                date: form.date,
                start_time: form.start_time || null,
                end_time: form.end_time || null,
                status: form.status,
                title: form.title || null,
                reason: form.reason || null,
                is_active: form.is_active,
            };

            if (editingOverride) {
                await axios.put(
                    `/api/v1/court-schedule-overrides/${editingOverride.id}`,
                    payload
                );
            } else {
                await axios.post(
                    '/api/v1/court-schedule-overrides',
                    payload
                );
            }

            setShowModal(false);
            setEditingOverride(null);
            setForm(emptyForm);

            await loadOverrides();
        } catch (error) {
            console.error('Failed to save override:', error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to save schedule override.');
            }
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (override) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this schedule override?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `/api/v1/court-schedule-overrides/${override.id}`
            );

            await loadOverrides();
        } catch (error) {
            console.error('Failed to delete override:', error);

            alert('Failed to delete schedule override.');
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Court Name
    |--------------------------------------------------------------------------
    */

    const getCourtName = (courtId) => {
        const court = courts.find(
            (item) => String(item.id) === String(courtId)
        );

        return court?.name ?? `Court #${courtId}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Date Formatting
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            undefined,
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Schedule Overrides
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage date-specific court schedule exceptions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Add Override
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        {/* Court */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Court
                            </label>

                            <select
                                value={selectedCourt}
                                onChange={(event) =>
                                    setSelectedCourt(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">
                                    All Courts
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

                        {/* Status */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={selectedStatus}
                                onChange={(event) =>
                                    setSelectedStatus(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                {statusOptions.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Results */}
                        <div className="flex items-end">
                            <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
                                Showing{' '}
                                <strong>
                                    {filteredOverrides.length}
                                </strong>{' '}
                                of{' '}
                                <strong>
                                    {overrides.length}
                                </strong>{' '}
                                overrides
                            </div>
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
                                        Date
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Time
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Title
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            Loading overrides...
                                        </td>
                                    </tr>
                                ) : filteredOverrides.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No schedule overrides found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOverrides.map((override) => (
                                        <tr
                                            key={override.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {getCourtName(
                                                    override.court_id
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                {formatDate(
                                                    override.date
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                {override.start_time &&
                                                override.end_time
                                                    ? `${String(
                                                          override.start_time
                                                      ).substring(
                                                          0,
                                                          5
                                                      )} - ${String(
                                                          override.end_time
                                                      ).substring(
                                                          0,
                                                          5
                                                      )}`
                                                    : 'Whole Day'}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        statusClasses[
                                                            override.status
                                                        ] ??
                                                        'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {String(
                                                        override.status ?? ''
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        String(
                                                            override.status ??
                                                                ''
                                                        ).slice(1)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {override.title || '-'}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            override
                                                        )
                                                    }
                                                    className="mr-3 font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            override
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
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingOverride
                                    ? 'Edit Schedule Override'
                                    : 'Add Schedule Override'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="space-y-4 p-6">

                                {/* Court */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Court
                                    </label>

                                    <select
                                        name="court_id"
                                        value={form.court_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

                                {/* Date */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        {statusOptions
                                            .filter(
                                                (option) =>
                                                    option.value !== ''
                                            )
                                            .map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Start / End */}
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>

                                </div>

                                <p className="text-xs text-gray-500">
                                    Leave the time fields empty to apply the
                                    override for the whole day.
                                </p>

                                {/* Title */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Private Event"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Reason
                                    </label>

                                    <textarea
                                        name="reason"
                                        value={form.reason}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Reason for this override..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>

                                {/* Active */}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />

                                    <span className="text-sm text-gray-700">
                                        Active
                                    </span>
                                </label>

                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

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
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingOverride
                                          ? 'Update Override'
                                          : 'Create Override'}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}