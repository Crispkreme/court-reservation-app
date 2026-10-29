import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
    ShieldCheck,
    CalendarClock,
    Crown,
    Clock,
    Users,
    CalendarDays,
    Save,
    X,
    Pencil,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Settings2,
} from "lucide-react";

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

export default function Privileges() {
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

            const data = await response.json().catch(() => ({}));

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

            const data = await response.json().catch(() => ({}));

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
        const activeCount = privileges.filter((item) => Boolean(item.is_active)).length;
    const priorityCount = privileges.filter((item) => Boolean(item.priority_booking)).length;
    const premiumCount = privileges.filter((item) => Boolean(item.premium_courts)).length;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Tiered Access &amp; Privileges
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                    Configure booking access, limits, cancellation, rescheduling, and court privileges for each membership tier.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard label="Configured Tiers" value={privileges.length} icon={<Settings2 size={19} />} />
                        <SummaryCard label="Active Configurations" value={activeCount} icon={<CheckCircle2 size={19} />} />
                        <SummaryCard label="Priority Booking" value={priorityCount} icon={<CalendarClock size={19} />} />
                        <SummaryCard label="Premium Court Access" value={premiumCount} icon={<Crown size={19} />} />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <Settings2 size={18} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    {editingId ? "Edit Tier Privileges" : "Configure Tier Privileges"}
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Define booking rules and benefits for a membership tier.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                            <div>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Booking Access</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="membership_type_id" className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Membership Tier <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="membership_type_id"
                                            name="membership_type_id"
                                            value={form.membership_type_id}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Select membership tier</option>
                                            {membershipTypes.map((type) => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="booking_advance_days" className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Advance Booking Days <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="booking_advance_days"
                                            type="number"
                                            name="booking_advance_days"
                                            min="0"
                                            max="365"
                                            value={form.booking_advance_days}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        />
                                        <p className="mt-1 text-xs text-slate-400">How far ahead members can book.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Booking Limits</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <NumberField label="Daily Booking Limit" name="daily_booking_limit" value={form.daily_booking_limit} onChange={handleChange} placeholder="Unlimited" />
                                    <NumberField label="Maximum Duration (minutes)" name="max_duration_minutes" value={form.max_duration_minutes} onChange={handleChange} placeholder="Unlimited" />
                                    <NumberField label="Maximum Players" name="max_players" value={form.max_players} onChange={handleChange} placeholder="Unlimited" />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Cancellation &amp; Rescheduling</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <NumberField label="Cancellation Window (hours)" name="cancellation_window_hours" value={form.cancellation_window_hours} onChange={handleChange} placeholder="No limit" />
                                    <NumberField label="Rescheduling Window (hours)" name="reschedule_window_hours" value={form.reschedule_window_hours} onChange={handleChange} placeholder="No limit" />
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <CheckboxField name="free_cancellation" label="Free Cancellation" checked={form.free_cancellation} onChange={handleChange} />
                                    <CheckboxField name="free_rescheduling" label="Free Rescheduling" checked={form.free_rescheduling} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Additional Benefits</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <CheckboxField name="priority_booking" label="Priority Booking" checked={form.priority_booking} onChange={handleChange} />
                                    <CheckboxField name="premium_courts" label="Premium Courts" checked={form.premium_courts} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-700">Administrator Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`${inputClass} resize-y`}
                                    placeholder="Optional notes about this tier..."
                                />
                                <div className="mt-4">
                                    <CheckboxField name="is_active" label="Configuration is active" checked={form.is_active} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <X size={16} />
                                        Cancel Edit
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            {editingId ? "Update Privileges" : "Save Privileges"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="font-semibold text-slate-900">Configured Membership Tiers</h2>
                            <p className="text-sm text-slate-500">Review and manage the privileges configured for each tier.</p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center gap-3 p-10 text-sm text-slate-500">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                Loading membership privileges...
                            </div>
                        ) : privileges.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                    <ShieldCheck size={22} />
                                </div>
                                <p className="font-semibold text-slate-800">No privileges configured</p>
                                <p className="mt-1 text-sm text-slate-500">Use the form above to configure the first membership tier.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3.5 font-semibold">Tier</th>
                                            <th className="px-5 py-3.5 font-semibold">Advance</th>
                                            <th className="px-5 py-3.5 font-semibold">Daily Limit</th>
                                            <th className="px-5 py-3.5 font-semibold">Duration</th>
                                            <th className="px-5 py-3.5 font-semibold">Priority</th>
                                            <th className="px-5 py-3.5 font-semibold">Premium Courts</th>
                                            <th className="px-5 py-3.5 font-semibold">Status</th>
                                            <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {privileges.map((privilege) => (
                                            <tr key={privilege.id} className="transition hover:bg-slate-50/80">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-slate-900">{getMembershipName(privilege)}</div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">{privilege.booking_advance_days} days</td>
                                                <td className="px-5 py-4 text-slate-600">{privilege.daily_booking_limit ?? "Unlimited"}</td>
                                                <td className="px-5 py-4 text-slate-600">{privilege.max_duration_minutes ? `${privilege.max_duration_minutes} min` : "Unlimited"}</td>
                                                <td className="px-5 py-4">
                                                    <BooleanBadge value={privilege.priority_booking} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <BooleanBadge value={privilege.premium_courts} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${privilege.is_active ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20"}`}>
                                                        {privilege.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => editPrivilege(privilege)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deletePrivilege(privilege.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </Layout>
    );
}

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function SummaryCard({ label, value, icon }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">{icon}</div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
    );
}

function BooleanBadge({ value }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${value ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-500/20"}`}>
            {value ? "Yes" : "No"}
        </span>
    );
}

function NumberField({ label, name, value, onChange, placeholder }) {
    const id = `privilege-${name}`;
    return (
        <div className="min-w-0">
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
            <input
                id={id}
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                min="1"
                className={inputClass}
                placeholder={placeholder}
            />
        </div>
    );
}

function CheckboxField({ name, label, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200 hover:bg-blue-50/40">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </label>
    );
}
}
