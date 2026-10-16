import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function MembersShow() {
    const { id } = useParams();

    const [member, setMember] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadMember = async () => {
        try {
            const response = await fetch(`/api/v1/members/${id}`, {
                headers: {
                    Accept: "application/json",
                },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setMember(data.member);

            setHistory(
                data.booking_history?.data ??
                    data.booking_history ??
                    []
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMember();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 text-gray-500">
                Loading member...
            </div>
        );
    }

    if (!member) {
        return (
            <div className="p-6">
                Member not found.
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    to="/members"
                    className="text-sm text-gray-500 hover:text-black"
                >
                    ← Members
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-white p-6">
                    <div className="mb-5 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-bold">
                            {member.first_name?.charAt(0)}
                            {member.last_name?.charAt(0)}
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">
                                {member.full_name}
                            </h1>

                            <p className="text-sm text-gray-500">
                                {member.member_number}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="text-gray-500">
                                Email
                            </span>

                            <p>{member.email || "—"}</p>
                        </div>

                        <div>
                            <span className="text-gray-500">
                                Phone
                            </span>

                            <p>{member.phone || "—"}</p>
                        </div>

                        <div>
                            <span className="text-gray-500">
                                Address
                            </span>

                            <p>{member.address || "—"}</p>
                        </div>
                    </div>

                    {member.player && (
                        <Link
                            to={`/players/${member.player.id}`}
                            className="mt-6 block rounded-lg bg-black px-4 py-2 text-center text-sm text-white"
                        >
                            View Player Profile
                        </Link>
                    )}
                </div>

                <div className="rounded-xl border bg-white p-6">
                    <h2 className="mb-5 text-lg font-semibold">
                        Membership
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-gray-500">
                                Status
                            </span>

                            <p className="mt-1 font-medium capitalize">
                                {member.membership_status}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Start Date
                            </span>

                            <p className="mt-1">
                                {member.membership_start_date
                                    ? new Date(
                                          member.membership_start_date
                                      ).toLocaleDateString()
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Expiration
                            </span>

                            <p className="mt-1">
                                {member.membership_expiration_date
                                    ? new Date(
                                          member.membership_expiration_date
                                      ).toLocaleDateString()
                                    : "No expiration"}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Player
                            </span>

                            <p className="mt-1">
                                {member.player
                                    ? "Registered player"
                                    : "No player"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-xl border bg-white">
                <div className="border-b p-6">
                    <h2 className="text-lg font-semibold">
                        Booking History
                    </h2>
                </div>

                {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No booking history.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        Date
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Court
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {history.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="border-t"
                                    >
                                        <td className="px-6 py-4">
                                            {booking.booking_date
                                                ? new Date(
                                                      booking.booking_date
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            {booking.court?.name ||
                                                "—"}
                                        </td>

                                        <td className="px-6 py-4 capitalize">
                                            {booking.status ||
                                                "—"}
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