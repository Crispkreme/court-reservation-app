import { useEffect, useState } from "react";
import { RefreshCw, Pencil, Trash2, Plus, ShieldCheck, Percent, Clock3, ListChecks, AlertCircle, CalendarX } from "lucide-react";
import Layout from "../../components/layout/Layout";
import CancellationPolicyModal from "../../components/modal/CancellationPolicyModal";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import StatCard from "../../components/StatCard";
import TableHeader from "../../components/TableHeader";
import {
    getCancellationPolicies,
    createCancellationPolicy,
    updateCancellationPolicy,
    deleteCancellationPolicy,
} from "../../services/cancellationPolicyService";
import {
    updateFormField,
    toggleFormArrayItem,
    resetFormState,
    getFieldError,
} from "../../utils/formatters";

const emptyForm = {
    name: "",
    cancellation_type: "",
    minimum_hours_before_booking: 0,
    maximum_hours_before_booking: "",
    refund_percentage: 0,
    description: "",
    priority: 0,
    is_active: true,
};

const cancellationTypes = [
    {
        value: "",
        label: "All Cancellation Types",
    },
    {
        value: "customer",
        label: "Customer Cancellation",
    },
    {
        value: "admin",
        label: "Admin Cancellation",
    },
    {
        value: "court_closure",
        label: "Court Closure",
    },
    {
        value: "no_show",
        label: "No-Show",
    },
];

const typeLabel = (type) => {
    const item = cancellationTypes.find(
        (option) => option.value === type
    );

    return item?.label || "All Cancellation Types";
};

export default function CancellationPolicies() {
    const [policies, setPolicies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const loadPolicies = async () => {
        try {
            const response = await getCancellationPolicies();
            setPolicies(response.data || []);
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to load cancellation policies."
            );
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await loadPolicies();
            setLoading(false);
        };

        loadData();
    }, []);

    const editPolicy = (policy) => {
        setEditingPolicy(policy);

        setForm({
            name: policy.name ?? "",
            cancellation_type: policy.cancellation_type ?? "",
            minimum_hours_before_booking: policy.minimum_hours_before_booking ?? 0,
            maximum_hours_before_booking: policy.maximum_hours_before_booking ?? "",
            refund_percentage: policy.refund_percentage ?? 0,
            description: policy.description ?? "",
            priority: policy.priority ?? 0,
            is_active: Boolean(policy.is_active),
        });

        setErrors({});
    };
    const submit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setErrors({});

        const payload = {
            ...form,
            cancellation_type: form.cancellation_type || null,
            maximum_hours_before_booking: form.maximum_hours_before_booking || null,
            minimum_hours_before_booking: Number(form.minimum_hours_before_booking),
            refund_percentage: Number(form.refund_percentage),
            priority: Number(form.priority),
            is_active: Boolean(form.is_active),
        };

        try {
            if (editingPolicy) {
                await updateCancellationPolicy(editingPolicy.id, payload);
            } else {
                await createCancellationPolicy(payload);
            }

            setIsModalOpen(false);
            resetForm();

            await loadPolicies();
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                return;
            }

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to save cancellation policy."
            );
        } finally {
            setSaving(false);
        }
    };
    const deletePolicy = async (policy) => {
        const confirmed = window.confirm(`Delete "${policy.name}"?`);

        if (!confirmed) return;

        try {
            await deleteCancellationPolicy(policy.id);
            await loadPolicies();
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete cancellation policy."
            );
        }
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    const openEditModal = (policy) => {
        editPolicy(policy);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const updateField = (field, value) => {
        updateFormField(setForm, field, value);
    };
    const resetForm = () => {
        resetFormState({
            setForm,
            emptyForm,
            setEditing: setEditingPolicy,
            setErrors,
        });
    };
    const getError = (field) => {
        return getFieldError(errors, field);
    };

    return (
        <Layout>
            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <CalendarX size={24} />
                        </div>

                        <div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Cancellation & Refund Policies
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Configure cancellation windows and refund percentages for court bookings.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus size={18} />
                        Add Policy
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total Policies"
                        value={policies.length}
                        type="total"
                        description="Configured cancellation rules"
                    />

                    <StatCard
                        label="Active Policies"
                        value={policies.filter((policy) => Boolean(policy.is_active)).length}
                        type="active"
                        description="Currently enabled"
                    />

                    <StatCard
                        label="Customer Policies"
                        value={policies.filter(
                            (policy) => policy.cancellation_type === "customer"
                        ).length}
                        type="pending"
                        description="Rules for customer cancellations"
                    />

                    <StatCard
                        label="Full Refund Policies"
                        value={policies.filter(
                            (policy) => Number(policy.refund_percentage) === 100
                        ).length}
                        type="expiring"
                        description="Policies offering a 100% refund"
                    />
                </div>

                <CancellationPolicyModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    editingPolicy={editingPolicy}
                    form={form}
                    updateField={updateField}
                    resetForm={resetForm}
                    submit={submit}
                    saving={saving}
                    getError={getError}
                    cancellationTypes={cancellationTypes}
                />

                {loading ? (
                    <LoadingState message="Loading booking rules..." />
                ) : policies.length === 0 ? (
                    <EmptyState
                        icon={ShieldCheck}
                        title="No booking rules found"
                        description="Create your first booking rule to configure booking limits and restrictions."
                    />
                ) : (
                    <>
                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                            <h2 className="font-semibold text-blue-900">
                                Refund Calculation
                            </h2>

                            <p className="mt-2 text-sm text-blue-800">
                                The system calculates the eligible
                                refund using the booking amount and
                                the refund percentage configured in
                                the applicable policy.
                            </p>

                            <div className="mt-3 text-sm text-blue-800">
                                <strong>Example:</strong> A ₱1,000
                                booking with a 50% refund policy
                                produces an eligible refund of ₱500.
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <TableHeader
                                title="Configured Cancellation Policies"
                                description="Manage cancellation rules and refund configurations."
                                count={policies.length}
                                countLabel="Policies"
                            />

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3.5 font-semibold">Policy</th>
                                            <th className="px-5 py-3.5 font-semibold">Type</th>
                                            <th className="px-5 py-3.5 font-semibold">Time Window</th>
                                            <th className="px-5 py-3.5 font-semibold">Refund</th>
                                            <th className="px-5 py-3.5 font-semibold">Priority</th>
                                            <th className="px-5 py-3.5 font-semibold">Status</th>
                                            <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {policies.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-5 py-16 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                            <ShieldCheck size={24} />
                                                        </div>

                                                        <p className="font-medium text-slate-700">
                                                            No cancellation policies found
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            Create your first cancellation policy to get started.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            policies.map((policy) => (
                                                <tr
                                                    key={policy.id}
                                                    className="transition-colors hover:bg-slate-50/70"
                                                >
                                                    {/* Policy */}
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-800">
                                                            {policy.name}
                                                        </div>

                                                        {policy.description && (
                                                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                                {policy.description}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Type */}
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                                            {typeLabel(policy.cancellation_type)}
                                                        </span>
                                                    </td>

                                                    {/* Time Window */}
                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-slate-700">
                                                            {policy.minimum_hours_before_booking ?? 0}
                                                            {" – "}
                                                            {policy.maximum_hours_before_booking !== null &&
                                                            policy.maximum_hours_before_booking !== ""
                                                                ? policy.maximum_hours_before_booking
                                                                : "∞"}
                                                            <span className="ml-1 text-xs font-normal text-slate-500">
                                                                hours
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Refund */}
                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold text-slate-800">
                                                            {Number(policy.refund_percentage)}%
                                                        </span>

                                                        <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-emerald-500"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        100,
                                                                        Math.max(
                                                                            0,
                                                                            Number(policy.refund_percentage) || 0
                                                                        )
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Priority */}
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                                                            {policy.priority}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4">
                                                        {policy.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(policy)}
                                                                title="Edit policy"
                                                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => deletePolicy(policy)}
                                                                title="Delete policy"
                                                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 size={16} />
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
                    </>
                )}

            </div>
        </Layout>
    );
}