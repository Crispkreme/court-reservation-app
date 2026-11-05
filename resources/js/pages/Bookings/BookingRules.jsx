
import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import TableHead from '../../components/table/TableHead';
import Layout from "../../components/layout/Layout";
import BookingRuleModal from "../../components/modal/BookingRuleModal";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { getBookingRules, getMembershipTiers, getSportCategories, getCourts, createBookingRule, updateBookingRule, deleteBookingRule as removeBookingRule } from "../../services/bookingRuleService";
import { updateFormField, toggleFormArrayItem, resetFormState, getFieldError } from "../../utils/formatters";

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

export default function BookingRulesIndex() {
    const [rules, setRules] = useState([]);
    const [membershipTiers, setMembershipTiers] = useState([]);
    const [sportCategories, setSportCategories] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState(() => ({
        ...emptyForm,
        allowed_days: [],
    }));
    
    const loadRules = async () => {
        try {
            const response = await getBookingRules();
            setRules(response.data || []);
        } catch (error) {
            console.error(
                "Failed to load booking rules:",
                error
            );
        }
    };
    const loadMembershipTiers = async () => {
        try {
            const response = await getMembershipTiers();
            setMembershipTiers(response.data || []);
        } catch (error) {
            console.error(
                "Failed to load membership tiers:",
                error
            );
        }
    };
    const loadSportCategories = async () => {
        try {
            const response = await getSportCategories();
            setSportCategories(response.data || []);
        } catch (error) {
            console.error(
                "Failed to load sport categories:",
                error
            );
        }
    };
    const loadCourts = async () => {
        try {
            const response = await getCourts();
            setCourts(response.data || []);
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

            try {
                await Promise.all([
                    loadRules(),
                    loadMembershipTiers(),
                    loadSportCategories(),
                    loadCourts(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    const editRule = (rule) => {
        setEditingRule(rule);

        setForm({
            name: rule.name ?? "",
            rule_type: rule.rule_type ?? "general",
            membership_tier_id: rule.membership_tier_id ?? "",
            sport_category_id: rule.sport_category_id ?? "",
            court_id: rule.court_id ?? "",
            event_name: rule.event_name ?? "",
            description: rule.description ?? "",
            starts_at: rule.starts_at
                ? rule.starts_at.substring(0, 16)
                : "",
            ends_at: rule.ends_at
                ? rule.ends_at.substring(0, 16)
                : "",
            booking_blocked: Boolean(rule.booking_blocked),
            max_bookings_per_day: rule.max_bookings_per_day ?? "",
            max_minutes_per_day: rule.max_minutes_per_day ?? "",
            max_future_bookings: rule.max_future_bookings ?? "",
            advance_booking_days: rule.advance_booking_days ?? "",
            allowed_start_time: rule.allowed_start_time ?? "",
            allowed_end_time: rule.allowed_end_time ?? "",
            allowed_days: Array.isArray(rule.allowed_days)
                ? rule.allowed_days
                : [],
            priority: rule.priority ?? 0,
            is_active: Boolean(rule.is_active),
        });

        setErrors({});
    };
    const openEditModal = (rule) => {
        editRule(rule);
        setIsModalOpen(true);
    };

    const submit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setErrors({});

        const payload = {
            ...form,
            membership_tier_id: form.membership_tier_id || null,
            sport_category_id: form.sport_category_id || null,
            court_id: form.court_id || null,
            max_bookings_per_day: form.max_bookings_per_day || null,
            max_minutes_per_day: form.max_minutes_per_day || null,
            max_future_bookings: form.max_future_bookings || null,
            advance_booking_days: form.advance_booking_days || null,
            allowed_start_time: form.allowed_start_time || null,
            allowed_end_time: form.allowed_end_time || null,
            starts_at: form.starts_at || null,
            ends_at: form.ends_at || null,
        };

        try {
            if (editingRule) {
                await updateBookingRule(
                    editingRule.id,
                    payload
                );
            } else {
                await createBookingRule(payload);
            }

            resetForm();
            setIsModalOpen(false);

            await loadRules();
        } catch (error) {
            console.error(
                "Failed to save booking rule:",
                error
            );

            if (error.response?.status === 422) {
                setErrors(
                    error.response.data.errors || {}
                );
                return;
            }

            alert(
                error.response?.data?.message ||
                "Failed to save booking rule."
            );
        } finally {
            setSaving(false);
        }
    };
    const deleteRule = async (rule) => {
        const confirmed = window.confirm(
            `Delete "${rule.name}"?`
        );

        if (!confirmed) return;

        try {
            await removeBookingRule(rule.id);
            await loadRules();
        } catch (error) {
            console.error(
                "Failed to delete booking rule:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete booking rule."
            );
        }
    };

    const updateField = (field, value) => {
        updateFormField(setForm, field, value);
    };
    const toggleDay = (day) => {
        toggleFormArrayItem(setForm, "allowed_days", day);
    };
    const resetForm = () => {
        resetFormState({
            setForm,
            emptyForm,
            setEditing: setEditingRule,
            setErrors,
        });
    };
    const getError = (field) => {
        return getFieldError(errors, field);
    };

    return (
        <Layout title="Booking Rules">
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <ShieldCheck size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Booking Rules
                            </h1>

                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Configure booking limits, time restrictions, and special event rules for your courts.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={17} />
                        New Rule
                    </button>
                </div>

                {loading ? (
                    <LoadingState message="Loading booking rules..." />
                ) : rules.length === 0 ? (
                    <EmptyState
                        icon={ShieldCheck}
                        title="No booking rules found"
                        description="Create your first booking rule to configure booking limits and restrictions."
                    />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                        {/* TABLE HEADER */}

                        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Configured Booking Rules
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {rules.length} rule{rules.length === 1 ? "" : "s"} configured
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <TableHead
                                    columns={[
                                        "Rule",
                                        "Type",
                                        "Membership",
                                        "Sport",
                                        "Court",
                                        "Daily Limit",
                                        "Minutes",
                                        "Advance",
                                        "Priority",
                                        "Status",
                                        { label: "Actions", align: "right" },
                                    ]}
                                />

                                <tbody className="divide-y divide-slate-100">
                                    {rules.map((rule) => (
                                        <tr
                                            key={rule.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-900">{rule.name}</td>
                                            <td className="px-4 py-3 capitalize text-slate-600">{rule.rule_type}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.membership_tier?.name || "All"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.sport_category?.name || "All"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.court?.name || "All"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.max_bookings_per_day ?? "—"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.max_minutes_per_day ?? "—"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.advance_booking_days != null ? `${rule.advance_booking_days} days` : "—"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">{rule.priority}</td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                {rule.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                        <CheckCircle2 size={12} />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                        <XCircle size={12} />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(rule)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    >
                                                        <Pencil size={13} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => deleteRule(rule)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Trash2 size={13} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* BOOKING RULE MODAL */}

            <BookingRuleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                editingRule={editingRule}
                form={form}
                updateField={updateField}
                toggleDay={toggleDay}
                submit={submit}
                resetForm={resetForm}
                saving={saving}
                getError={getError}
                membershipTiers={membershipTiers}
                sportCategories={sportCategories}
                courts={courts}
            />
        </Layout>
    );
}