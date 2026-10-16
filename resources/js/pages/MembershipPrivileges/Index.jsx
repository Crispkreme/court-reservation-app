import { useEffect, useState } from "react";

const emptyForm = {
    membership_type_id: "",
    priority_booking: false,
    booking_advance_days: 30,
    premium_courts: false,
    daily_booking_limit: "",
    max_duration_minutes: "",
    max_players: "",
    cancellation_window_hours: "",
    free_cancellation: false,
    reschedule_window_hours: "",
    free_rescheduling: false,
    notes: "",
    is_active: true,
};

export default function MembershipPrivileges() {
    const [membershipTypes, setMembershipTypes] = useState([]);
    const [privileges, setPrivileges] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const api = "/api/v1";

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [typesResponse, privilegesResponse] =
                await Promise.all([
                    fetch(
                        `${api}/membership-privileges-membership-types`,
                        {
                            headers: {
                                Accept: "application/json",
                            },
                            credentials: "include",
                        }
                    ),
                    fetch(`${api}/membership-privileges`, {
                        headers: {
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }),
                ]);

            if (!typesResponse.ok || !privilegesResponse.ok) {
                throw new Error(
                    "Unable to load membership privileges."
                );
            }

            const typesData = await typesResponse.json();
            const privilegesData =
                await privilegesResponse.json();

            setMembershipTypes(typesData.data || []);
            setPrivileges(privilegesData.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleChange(event) {
        const { name, value, type, checked } =
            event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    }

    function editPrivilege(privilege) {
        setEditingId(privilege.id);

        setForm({
            membership_type_id:
                privilege.membership_type_id ?? "",
            priority_booking:
                Boolean(privilege.priority_booking),
            booking_advance_days:
                privilege.booking_advance_days ?? 30,
            premium_courts:
                Boolean(privilege.premium_courts),
            daily_booking_limit:
                privilege.daily_booking_limit ?? "",
            max_duration_minutes:
                privilege.max_duration_minutes ?? "",
            max_players:
                privilege.max_players ?? "",
            cancellation_window_hours:
                privilege.cancellation_window_hours ?? "",
            free_cancellation:
                Boolean(privilege.free_cancellation),
            reschedule_window_hours:
                privilege.reschedule_window_hours ?? "",
            free_rescheduling:
                Boolean(privilege.free_rescheduling),
            notes:
                privilege.notes ?? "",
            is_active:
                Boolean(privilege.is_active),
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function resetForm() {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");

        const payload = {
            membership_type_id:
                Number(form.membership_type_id),

            priority_booking:
                Boolean(form.priority_booking),

            booking_advance_days:
                Number(form.booking_advance_days),

            premium_courts:
                Boolean(form.premium_courts),

            daily_booking_limit:
                form.daily_booking_limit === ""
                    ? null
                    : Number(form.daily_booking_limit),

            max_duration_minutes:
                form.max_duration_minutes === ""
                    ? null
                    : Number(form.max_duration_minutes),

            max_players:
                form.max_players === ""
                    ? null
                    : Number(form.max_players),

            cancellation_window_hours:
                form.cancellation_window_hours === ""
                    ? null
                    : Number(
                          form.cancellation_window_hours
                      ),

            free_cancellation:
                Boolean(form.free_cancellation),

            reschedule_window_hours:
                form.reschedule_window_hours === ""
                    ? null
                    : Number(
                          form.reschedule_window_hours
                      ),

            free_rescheduling:
                Boolean(form.free_rescheduling),

            notes: form.notes || null,

            is_active:
                Boolean(form.is_active),
        };

        try {
            const url = editingId
                ? `${api}/membership-privileges/${editingId}`
                : `${api}/membership-privileges`;

            const method = editingId
                ? "PUT"
                : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Accept: "application/json",
                    "Content-Type":
                        "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector(
                                'meta[name="csrf-token"]'
                            )
                            ?.getAttribute("content"),
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const messages = Object.values(
                        data.errors
                    )
                        .flat()
                        .join(" ");

                    throw new Error(messages);
                }

                throw new Error(
                    data.message ||
                        "Unable to save privileges."
                );
            }

            resetForm();
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deletePrivilege(id) {
        if (
            !window.confirm(
                "Delete this membership privilege configuration?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `${api}/membership-privileges/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN":
                            document
                                .querySelector(
                                    'meta[name="csrf-token"]'
                                )
                                ?.getAttribute(
                                    "content"
                                ),
                    },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to delete privileges."
                );
            }

            await loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    function getMembershipName(privilege) {
        return (
            privilege.membership_type?.name ||
            "Unknown tier"
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Tiered Access & Privileges
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    Configure booking access, limits,
                    cancellation, rescheduling, and
                    court privileges for each membership
                    tier.
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        {editingId
                            ? "Edit Tier Privileges"
                            : "Configure Tier Privileges"}
                    </h2>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Membership Tier
                            </label>

                            <select
                                name="membership_type_id"
                                value={
                                    form.membership_type_id
                                }
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="">
                                    Select membership tier
                                </option>

                                {membershipTypes.map(
                                    (type) => (
                                        <option
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Advance Booking Days
                            </label>

                            <input
                                type="number"
                                name="booking_advance_days"
                                min="0"
                                max="365"
                                value={
                                    form.booking_advance_days
                                }
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <NumberField
                            label="Daily Booking Limit"
                            name="daily_booking_limit"
                            value={
                                form.daily_booking_limit
                            }
                            onChange={handleChange}
                            placeholder="Unlimited"
                        />

                        <NumberField
                            label="Maximum Duration (minutes)"
                            name="max_duration_minutes"
                            value={
                                form.max_duration_minutes
                            }
                            onChange={handleChange}
                            placeholder="Unlimited"
                        />

                        <NumberField
                            label="Maximum Players"
                            name="max_players"
                            value={form.max_players}
                            onChange={handleChange}
                            placeholder="Unlimited"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <NumberField
                            label="Cancellation Window (hours)"
                            name="cancellation_window_hours"
                            value={
                                form.cancellation_window_hours
                            }
                            onChange={handleChange}
                            placeholder="No limit"
                        />

                        <NumberField
                            label="Rescheduling Window (hours)"
                            name="reschedule_window_hours"
                            value={
                                form.reschedule_window_hours
                            }
                            onChange={handleChange}
                            placeholder="No limit"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <CheckboxField
                            name="priority_booking"
                            label="Priority Booking"
                            checked={
                                form.priority_booking
                            }
                            onChange={handleChange}
                        />

                        <CheckboxField
                            name="premium_courts"
                            label="Premium Courts"
                            checked={
                                form.premium_courts
                            }
                            onChange={handleChange}
                        />

                        <CheckboxField
                            name="free_cancellation"
                            label="Free Cancellation"
                            checked={
                                form.free_cancellation
                            }
                            onChange={handleChange}
                        />

                        <CheckboxField
                            name="free_rescheduling"
                            label="Free Rescheduling"
                            checked={
                                form.free_rescheduling
                            }
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Administrator Notes
                        </label>

                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-lg border px-3 py-2"
                            placeholder="Optional notes about this tier..."
                        />
                    </div>

                    <CheckboxField
                        name="is_active"
                        label="Active"
                        checked={form.is_active}
                        onChange={handleChange}
                    />

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                  ? "Update Privileges"
                                  : "Save Privileges"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border px-5 py-2"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b p-5">
                    <h2 className="font-semibold">
                        Configured Membership Tiers
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">
                        Loading...
                    </div>
                ) : privileges.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No membership privileges have
                        been configured yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left">
                                        Tier
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Advance
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Daily Limit
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Duration
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Priority
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Premium Courts
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {privileges.map(
                                    (privilege) => (
                                        <tr
                                            key={
                                                privilege.id
                                            }
                                        >
                                            <td className="px-5 py-4 font-medium">
                                                {getMembershipName(
                                                    privilege
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                {
                                                    privilege.booking_advance_days
                                                }{" "}
                                                days
                                            </td>

                                            <td className="px-5 py-4">
                                                {privilege.daily_booking_limit ??
                                                    "Unlimited"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {privilege.max_duration_minutes
                                                    ? `${privilege.max_duration_minutes} min`
                                                    : "Unlimited"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {privilege.priority_booking
                                                    ? "Yes"
                                                    : "No"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {privilege.premium_courts
                                                    ? "Yes"
                                                    : "No"}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editPrivilege(
                                                                privilege
                                                            )
                                                        }
                                                        className="rounded-lg border px-3 py-1.5"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deletePrivilege(
                                                                privilege.id
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function NumberField({
    label,
    name,
    value,
    onChange,
    placeholder,
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">
                {label}
            </label>

            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                min="1"
                className="w-full rounded-lg border px-3 py-2"
                placeholder={placeholder}
            />
        </div>
    );
}

function CheckboxField({
    name,
    label,
    checked,
    onChange,
}) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4"
            />

            <span className="text-sm font-medium">
                {label}
            </span>
        </label>
    );
}