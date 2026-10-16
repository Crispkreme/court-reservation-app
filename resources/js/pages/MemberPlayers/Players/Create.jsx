import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PlayersCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        player_type: "guest",
    });

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

        try {
            const response = await fetch("/api/v1/players", {
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
                alert(data.message || "Unable to create player.");
                return;
            }

            navigate(`/players/${data.player.id}`);
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <Link
                to="/players"
                className="text-sm text-gray-500 hover:text-black"
            >
                ← Players
            </Link>

            <div className="mb-6 mt-3">
                <h1 className="text-2xl font-bold">
                    Add Guest Player
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Create a player who is not registered as a member.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-2xl rounded-xl border bg-white p-6"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        name="first_name"
                        placeholder="First name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
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
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Link
                        to="/players"
                        className="rounded-lg border px-5 py-2"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
                    >
                        {saving
                            ? "Creating..."
                            : "Create Guest Player"}
                    </button>
                </div>
            </form>
        </div>
    );
}