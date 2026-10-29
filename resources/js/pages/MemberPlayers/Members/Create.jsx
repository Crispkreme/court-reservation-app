import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

export default function CreateMembers() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setErrors({});

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

            const data = await response.json();

            if (!response.ok) {
                setErrors(data.errors || {});
                alert(data.message || "Unable to register member.");
                return;
            }

            navigate(`/members/${data.member.id}`);
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    to="/members"
                    className="text-sm text-gray-500 hover:text-black"
                >
                    ← Back to Members
                </Link>

                <h1 className="mt-3 text-2xl font-bold">
                    Register Member
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Create a new member and automatically register them as a
                    player.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border bg-white p-6"
            >
                <h2 className="mb-4 text-lg font-semibold">
                    Personal Information
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        name="first_name"
                        placeholder="First name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                        className="rounded-lg border px-4 py-2"
                    />

                    <input
                        name="middle_name"
                        placeholder="Middle name"
                        value={form.middle_name}
                        onChange={handleChange}
                        className="rounded-lg border px-4 py-2"
                    />

                    <input
                        name="last_name"
                        placeholder="Last name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                        className="rounded-lg border px-4 py-2"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="rounded-lg border px-4 py-2"
                    />

                    <input
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="rounded-lg border px-4 py-2"
                    />

                    <input
                        type="date"
                        name="date_of_birth"
                        value={form.date_of_birth}
                        onChange={handleChange}
                        className="rounded-lg border px-4 py-2"
                    />

                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="rounded-lg border px-4 py-2"
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <textarea
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                    className="mt-4 w-full rounded-lg border px-4 py-2"
                />

                <hr className="my-6" />

                <h2 className="mb-4 text-lg font-semibold">
                    Membership
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm text-gray-600">
                            Start Date
                        </label>

                        <input
                            type="date"
                            name="membership_start_date"
                            value={form.membership_start_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-600">
                            Expiration Date
                        </label>

                        <input
                            type="date"
                            name="membership_expiration_date"
                            value={form.membership_expiration_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-600">
                            Status
                        </label>

                        <select
                            name="membership_status"
                            value={form.membership_status}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-2"
                        >
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <textarea
                    name="notes"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    className="mt-4 w-full rounded-lg border px-4 py-2"
                />

                <div className="mt-6 flex justify-end gap-3">
                    <Link
                        to="/members"
                        className="rounded-lg border px-5 py-2"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
                    >
                        {saving ? "Registering..." : "Register Member"}
                    </button>
                </div>
            </form>
        </div>
    );
}