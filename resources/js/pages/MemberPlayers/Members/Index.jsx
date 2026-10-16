import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MembersIndex() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const loadMembers = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (status) {
                params.append("status", status);
            }

            const response = await fetch(
                `/api/v1/members?${params.toString()}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load members.");
            }

            const data = await response.json();

            setMembers(data.data ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadMembers();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status]);

    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";

            case "expired":
                return "bg-red-100 text-red-700";

            case "suspended":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Members
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage registered members and their memberships.
                    </p>
                </div>

                <Link
                    to="/members/create"
                    className="rounded-lg bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
                >
                    + Register Member
                </Link>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-2">
                <input
                    type="text"
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading members...
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500">
                            No members found.
                        </p>

                        <Link
                            to="/members/create"
                            className="mt-3 inline-block text-sm font-medium text-black underline"
                        >
                            Register your first member
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        Member
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Member No.
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Contact
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Expiration
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {members.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="border-b last:border-0 hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {member.full_name}
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                {member.email || "No email"}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {member.member_number}
                                        </td>

                                        <td className="px-6 py-4">
                                            {member.phone || "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    member.membership_status
                                                )}`}
                                            >
                                                {member.membership_status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {member.membership_expiration_date
                                                ? new Date(
                                                      member.membership_expiration_date
                                                  ).toLocaleDateString()
                                                : "No expiration"}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/members/${member.id}`}
                                                className="font-medium text-black hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}