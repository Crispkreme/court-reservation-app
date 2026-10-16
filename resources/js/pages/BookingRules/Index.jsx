import { useEffect, useState } from "react";

const emptyForm = {
    name: "",
    rule_type: "general",
    membership_tier_id: "",
    sport_category_id: "",
    court_id: "",
    event_name: "",
    description: "",
    starts_at: "",
    ends_at: "",
    booking_blocked: false,
    max_bookings_per_day: "",
    max_minutes_per_day: "",
    max_future_bookings: "",
    advance_booking_days: "",
    allowed_start_time: "",
    allowed_end_time: "",
    allowed_days: [],
    priority: 0,
    is_active: true,
};

const days = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

export default function BookingRulesIndex() {
    const [rules, setRules] = useState([]);

    const [membershipTiers, setMembershipTiers] = useState([]);
    const [sportCategories, setSportCategories] = useState([]);
    const [courts, setCourts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingRule, setEditingRule] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [errors, setErrors] = useState({});

    const loadRules = async () => {
        try {
            const response = await fetch(
                "/api/v1/booking-rules",
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load booking rules."
                );
            }

            setRules(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const loadMembershipTiers = async () => {
        try {
            const response = await fetch(
                "/api/v1/membership-tiers",
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setMembershipTiers(data.data || []);
        } catch (error) {
            console.error(
                "Failed to load membership tiers:",
                error
            );
        }
    };

    const loadSportCategories = async () => {
        try {
            const response = await fetch(
                "/api/v1/sport-categories",
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setSportCategories(data.data || []);
        } catch (error) {
            console.error(
                "Failed to load sport categories:",
                error
            );
        }
    };

    const loadCourts = async () => {
        try {
            const response = await fetch(
                "/api/v1/courts",
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setCourts(data.data || []);
        } catch (error) {
            console.error(
                "Failed to load courts:",
                error
            );
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await Promise.all([
                loadRules(),
                loadMembershipTiers(),
                loadSportCategories(),
                loadCourts(),
            ]);

            setLoading(false);
        };

        loadData();
    }, []);

    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const toggleDay = (day) => {
        setForm((previous) => {
            const exists =
                previous.allowed_days.includes(day);

            return {
                ...previous,
                allowed_days: exists
                    ? previous.allowed_days.filter(
                          (item) => item !== day
                      )
                    : [
                          ...previous.allowed_days,
                          day,
                      ],
            };
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingRule(null);
        setErrors({});
    };

    const editRule = (rule) => {
        setEditingRule(rule);

        setForm({
            name: rule.name ?? "",
            rule_type: rule.rule_type ?? "general",
            membership_tier_id:
                rule.membership_tier_id ?? "",
            sport_category_id:
                rule.sport_category_id ?? "",
            court_id: rule.court_id ?? "",
            event_name: rule.event_name ?? "",
            description: rule.description ?? "",
            starts_at: rule.starts_at
                ? rule.starts_at.substring(0, 16)
                : "",
            ends_at: rule.ends_at
                ? rule.ends_at.substring(0, 16)
                : "",
            booking_blocked:
                Boolean(rule.booking_blocked),
            max_bookings_per_day:
                rule.max_bookings_per_day ?? "",
            max_minutes_per_day:
                rule.max_minutes_per_day ?? "",
            max_future_bookings:
                rule.max_future_bookings ?? "",
            advance_booking_days:
                rule.advance_booking_days ?? "",
            allowed_start_time:
                rule.allowed_start_time ?? "",
            allowed_end_time:
                rule.allowed_end_time ?? "",
            allowed_days:
                rule.allowed_days ?? [],
            priority: rule.priority ?? 0,
            is_active: Boolean(rule.is_active),
        });

        setErrors({});

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const submit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setErrors({});

        const url = editingRule
            ? `/api/v1/booking-rules/${editingRule.id}`
            : "/api/v1/booking-rules";

        const method = editingRule ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...form,

                    membership_tier_id:
                        form.membership_tier_id || null,

                    sport_category_id:
                        form.sport_category_id || null,

                    court_id:
                        form.court_id || null,

                    max_bookings_per_day:
                        form.max_bookings_per_day || null,

                    max_minutes_per_day:
                        form.max_minutes_per_day || null,

                    max_future_bookings:
                        form.max_future_bookings || null,

                    advance_booking_days:
                        form.advance_booking_days || null,

                    allowed_start_time:
                        form.allowed_start_time || null,

                    allowed_end_time:
                        form.allowed_end_time || null,

                    starts_at:
                        form.starts_at || null,

                    ends_at:
                        form.ends_at || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    setErrors(data.errors || {});
                    return;
                }

                throw new Error(
                    data.message ||
                        "Failed to save booking rule."
                );
            }

            resetForm();

            await loadRules();
        } catch (error) {
            console.error(error);

            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteRule = async (rule) => {
        const confirmed = window.confirm(
            `Delete "${rule.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/booking-rules/${rule.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete booking rule."
                );
            }

            await loadRules();
        } catch (error) {
            console.error(error);

            alert(error.message);
        }
    };

    const getError = (field) => {
        return errors[field]?.[0] || "";
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="rounded-lg border bg-white p-6">
                    Loading booking rules...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Booking Rules
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Configure booking limits and
                    restrictions for members.
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={submit}
                className="rounded-lg border bg-white p-6 shadow-sm"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {editingRule
                                ? "Edit Booking Rule"
                                : "Create Booking Rule"}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Configure the conditions under
                            which this rule applies.
                        </p>
                    </div>

                    {editingRule && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Rule name */}
                    <div>
                        <label className="block text-sm font-medium">
                            Rule Name
                        </label>

                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                updateField(
                                    "name",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="Standard Member Limits"
                            required
                        />

                        {getError("name") && (
                            <p className="mt-1 text-sm text-red-600">
                                {getError("name")}
                            </p>
                        )}
                    </div>

                    {/* Rule type */}
                    <div>
                        <label className="block text-sm font-medium">
                            Rule Type
                        </label>

                        <select
                            value={form.rule_type}
                            onChange={(e) =>
                                updateField(
                                    "rule_type",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                        >
                            <option value="general">
                                General
                            </option>

                            <option value="event">
                                Special Event
                            </option>

                            <option value="tournament">
                                Tournament
                            </option>
                        </select>
                    </div>

                    {/* Membership */}
                    <div>
                        <label className="block text-sm font-medium">
                            Membership Tier
                        </label>

                        <select
                            value={
                                form.membership_tier_id
                            }
                            onChange={(e) =>
                                updateField(
                                    "membership_tier_id",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                        >
                            <option value="">
                                All Membership Tiers
                            </option>

                            {membershipTiers.map(
                                (tier) => (
                                    <option
                                        key={tier.id}
                                        value={tier.id}
                                    >
                                        {tier.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* Sport */}
                    <div>
                        <label className="block text-sm font-medium">
                            Sport
                        </label>

                        <select
                            value={
                                form.sport_category_id
                            }
                            onChange={(e) =>
                                updateField(
                                    "sport_category_id",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                        >
                            <option value="">
                                All Sports
                            </option>

                            {sportCategories.map(
                                (sport) => (
                                    <option
                                        key={sport.id}
                                        value={sport.id}
                                    >
                                        {sport.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* Court */}
                    <div>
                        <label className="block text-sm font-medium">
                            Court
                        </label>

                        <select
                            value={form.court_id}
                            onChange={(e) =>
                                updateField(
                                    "court_id",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
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

                    {/* Max bookings */}
                    <div>
                        <label className="block text-sm font-medium">
                            Maximum Bookings / Day
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                form.max_bookings_per_day
                            }
                            onChange={(e) =>
                                updateField(
                                    "max_bookings_per_day",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="3"
                        />
                    </div>

                    {/* Max minutes */}
                    <div>
                        <label className="block text-sm font-medium">
                            Maximum Minutes / Day
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                form.max_minutes_per_day
                            }
                            onChange={(e) =>
                                updateField(
                                    "max_minutes_per_day",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="180"
                        />
                    </div>

                    {/* Future bookings */}
                    <div>
                        <label className="block text-sm font-medium">
                            Maximum Future Bookings
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                form.max_future_bookings
                            }
                            onChange={(e) =>
                                updateField(
                                    "max_future_bookings",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="5"
                        />
                    </div>

                    {/* Advance */}
                    <div>
                        <label className="block text-sm font-medium">
                            Advance Booking Window
                        </label>

                        <div className="mt-1 flex">
                            <input
                                type="number"
                                min="0"
                                value={
                                    form.advance_booking_days
                                }
                                onChange={(e) =>
                                    updateField(
                                        "advance_booking_days",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-l-md border p-2"
                                placeholder="30"
                            />

                            <span className="flex items-center rounded-r-md border border-l-0 bg-gray-50 px-3 text-sm text-gray-500">
                                days
                            </span>
                        </div>
                    </div>
                </div>

                {/* Time restrictions */}
                <div className="mt-6 border-t pt-6">
                    <h3 className="mb-4 font-semibold">
                        Time Restrictions
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">
                                Allowed Start Time
                            </label>

                            <input
                                type="time"
                                value={
                                    form.allowed_start_time
                                }
                                onChange={(e) =>
                                    updateField(
                                        "allowed_start_time",
                                        e.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-md border p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Allowed End Time
                            </label>

                            <input
                                type="time"
                                value={
                                    form.allowed_end_time
                                }
                                onChange={(e) =>
                                    updateField(
                                        "allowed_end_time",
                                        e.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-md border p-2"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium">
                            Allowed Days
                        </label>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {days.map((day) => {
                                const selected =
                                    form.allowed_days.includes(
                                        day.value
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={day.value}
                                        onClick={() =>
                                            toggleDay(
                                                day.value
                                            )
                                        }
                                        className={`rounded-md border px-3 py-2 text-sm ${
                                            selected
                                                ? "bg-gray-900 text-white"
                                                : "bg-white hover:bg-gray-50"
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event / tournament */}
                {(form.rule_type === "event" ||
                    form.rule_type ===
                        "tournament") && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="mb-4 font-semibold">
                            Event / Tournament
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">
                                    Event Name
                                </label>

                                <input
                                    type="text"
                                    value={form.event_name}
                                    onChange={(e) =>
                                        updateField(
                                            "event_name",
                                            e.target.value
                                        )
                                    }
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium">
                                        Starts At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={form.starts_at}
                                        onChange={(e) =>
                                            updateField(
                                                "starts_at",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Ends At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={form.ends_at}
                                        onChange={(e) =>
                                            updateField(
                                                "ends_at",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border p-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        form.description
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    rows="3"
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={
                                        form.booking_blocked
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "booking_blocked",
                                            e.target.checked
                                        )
                                    }
                                />

                                <span className="text-sm">
                                    Block bookings during
                                    this event
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Priority / active */}
                <div className="mt-6 border-t pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">
                                Priority
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={form.priority}
                                onChange={(e) =>
                                    updateField(
                                        "priority",
                                        e.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-md border p-2"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Higher priority rules are
                                evaluated first.
                            </p>
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={
                                        form.is_active
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "is_active",
                                            e.target.checked
                                        )
                                    }
                                />

                                <span className="text-sm">
                                    Rule is active
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingRule
                              ? "Update Rule"
                              : "Create Rule"}
                    </button>

                    {editingRule && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-md border px-5 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Rules table */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-5">
                    <h2 className="font-semibold">
                        Configured Booking Rules
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">
                                    Rule
                                </th>

                                <th className="px-4 py-3">
                                    Type
                                </th>

                                <th className="px-4 py-3">
                                    Membership
                                </th>

                                <th className="px-4 py-3">
                                    Sport
                                </th>

                                <th className="px-4 py-3">
                                    Court
                                </th>

                                <th className="px-4 py-3">
                                    Daily Limit
                                </th>

                                <th className="px-4 py-3">
                                    Minutes
                                </th>

                                <th className="px-4 py-3">
                                    Advance
                                </th>

                                <th className="px-4 py-3">
                                    Priority
                                </th>

                                <th className="px-4 py-3">
                                    Status
                                </th>

                                <th className="px-4 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {rules.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="11"
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No booking rules
                                        configured.
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule) => (
                                    <tr
                                        key={rule.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {rule.name}
                                        </td>

                                        <td className="px-4 py-3 capitalize">
                                            {rule.rule_type}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule
                                                .membership_tier
                                                ?.name ||
                                                "All"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule
                                                .sport_category
                                                ?.name ||
                                                "All"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule.court
                                                ?.name ||
                                                "All"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule.max_bookings_per_day ??
                                                "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule.max_minutes_per_day ??
                                                "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule.advance_booking_days !==
                                            null
                                                ? `${rule.advance_booking_days} days`
                                                : "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule.priority}
                                        </td>

                                        <td className="px-4 py-3">
                                            {rule.is_active ? (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        editRule(
                                                            rule
                                                        )
                                                    }
                                                    className="rounded border px-3 py-1 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteRule(
                                                            rule
                                                        )
                                                    }
                                                    className="rounded border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}