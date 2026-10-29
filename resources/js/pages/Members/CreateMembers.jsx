import { useState, cloneElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
    ArrowLeft,
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    MapPin,
    CreditCard,
    FileText,
    Save,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

const initialForm = {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    membership_start_date: "",
    membership_expiration_date: "",
    membership_status: "active",
    notes: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function CreateMembers() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
        setSubmitError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSubmitError("");

        try {
            const response = await fetch("/api/v1/members", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrors(data.errors || {});
                setSubmitError(data.message || "Unable to register member. Please check the fields and try again.");
                return;
            }

            const memberId = data.member?.id ?? data.data?.id;
            if (memberId) {
                navigate(`/members/${memberId}`);
            } else {
                navigate("/members");
            }
        } catch (error) {
            console.error(error);
            setSubmitError("Something went wrong while registering the member. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const fieldError = (name) => {
        const value = errors[name];
        return Array.isArray(value) ? value[0] : value;
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div>
                        <Link
                            to="/members"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700"
                        >
                            <ArrowLeft size={16} />
                            Back to Members
                        </Link>

                        <div className="mt-4 flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                <UserRound size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Register Member
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Create a new member and automatically register them as a player.
                                </p>
                            </div>
                        </div>
                    </div>

                    {submitError && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <UserRound size={18} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Personal Information</h2>
                                    <p className="mt-0.5 text-sm text-slate-500">Enter the member's personal and contact details.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                                <Field label="First Name" name="first_name" required error={fieldError("first_name")}>
                                    <input name="first_name" value={form.first_name} onChange={handleChange} required autoComplete="given-name" placeholder="Enter first name" className={inputClass} />
                                </Field>
                                <Field label="Middle Name" name="middle_name" error={fieldError("middle_name")}>
                                    <input name="middle_name" value={form.middle_name} onChange={handleChange} autoComplete="additional-name" placeholder="Enter middle name" className={inputClass} />
                                </Field>
                                <Field label="Last Name" name="last_name" required error={fieldError("last_name")}>
                                    <input name="last_name" value={form.last_name} onChange={handleChange} required autoComplete="family-name" placeholder="Enter last name" className={inputClass} />
                                </Field>
                                <Field label="Email Address" name="email" error={fieldError("email")}>
                                    <div className="relative">
                                        <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="name@example.com" className={`${inputClass} pl-9`} />
                                    </div>
                                </Field>
                                <Field label="Phone Number" name="phone" error={fieldError("phone")}>
                                    <div className="relative">
                                        <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" placeholder="Enter phone number" className={`${inputClass} pl-9`} />
                                    </div>
                                </Field>
                                <Field label="Date of Birth" name="date_of_birth" error={fieldError("date_of_birth")}>
                                    <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className={inputClass} />
                                </Field>
                                <Field label="Gender" name="gender" error={fieldError("gender")}>
                                    <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <Field label="Address" name="address" error={fieldError("address")}>
                                        <div className="relative">
                                            <MapPin size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                                            <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Enter home address" className={`${inputClass} resize-y pl-9`} />
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Membership Details</h2>
                                    <p className="mt-0.5 text-sm text-slate-500">Set the membership dates and current status.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                                <Field label="Start Date" name="membership_start_date" error={fieldError("membership_start_date")}>
                                    <input type="date" name="membership_start_date" value={form.membership_start_date} onChange={handleChange} className={inputClass} />
                                </Field>
                                <Field label="Expiration Date" name="membership_expiration_date" error={fieldError("membership_expiration_date")}>
                                    <input type="date" name="membership_expiration_date" value={form.membership_expiration_date} onChange={handleChange} className={inputClass} />
                                </Field>
                                <Field label="Membership Status" name="membership_status" error={fieldError("membership_status")}>
                                    <select name="membership_status" value={form.membership_status} onChange={handleChange} className={inputClass}>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Additional Notes</h2>
                                    <p className="mt-0.5 text-sm text-slate-500">Add any relevant information about this member.</p>
                                </div>
                            </div>
                            <div className="p-5 sm:p-6">
                                <Field label="Notes" name="notes" error={fieldError("notes")}>
                                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Enter notes (optional)" className={`${inputClass} resize-y`} />
                                </Field>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                            <Link
                                to="/members"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Register Member
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

function Field({ label, name, required = false, error, children }) {
    const id = `member-${name}`;

    return (
        <div className="min-w-0">
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}{required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {cloneElement(children, { id, name: children.props.name || name })}
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    );
}

