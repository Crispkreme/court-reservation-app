import React, { useEffect, useMemo, useState } from "react";

const API = "/api/v1";

const REPORTS = [
    {
        value: "daily_booking",
        label: "Daily Booking Report",
    },
    {
        value: "court_utilization",
        label: "Court Utilization Report",
    },
    {
        value: "sport_category",
        label: "Sport Category Report",
    },
    {
        value: "revenue",
        label: "Revenue Report",
    },
    {
        value: "payment",
        label: "Payment Report",
    },
    {
        value: "outstanding_fees",
        label: "Outstanding / Aged Fees",
    },
    {
        value: "cancellation",
        label: "Cancellation Report",
    },
    {
        value: "rescheduling",
        label: "Rescheduling Report",
    },
    {
        value: "no_show",
        label: "No-Show Report",
    },
    {
        value: "membership",
        label: "Membership Report",
    },
    {
        value: "waitlist",
        label: "Waitlist Report",
    },
    {
        value: "failed_transaction",
        label: "Failed Transaction Report",
    },
    {
        value: "booking_activity",
        label: "Booking Activity / History",
    },
];

function token() {
    return localStorage.getItem("auth_token");
}

async function request(url) {
    const response = await fetch(`${API}${url}`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to load report."
        );
    }

    return data;
}

function money(value) {
    return Number(value || 0).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}

function formatValue(value, key) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    if (
        typeof value === "number" &&
        (
            key?.includes("amount") ||
            key?.includes("revenue") ||
            key?.includes("balance") ||
            key?.includes("value")
        )
    ) {
        return money(value);
    }

    if (
        typeof value === "boolean"
    ) {
        return value ? "Yes" : "No";
    }

    if (
        typeof value === "object"
    ) {
        return JSON.stringify(value);
    }

    return String(value);
}

function titleCase(value) {
    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

export default function ReportsIndex() {
    const [report, setReport] =
        useState("daily_booking");

    const [dateFrom, setDateFrom] =
        useState("");

    const [dateTo, setDateTo] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const selectedReport = useMemo(
        () =>
            REPORTS.find(
                (item) =>
                    item.value === report
            ),
        [report]
    );

    async function loadReport() {
        try {
            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            params.append(
                "report",
                report
            );

            if (dateFrom) {
                params.append(
                    "date_from",
                    dateFrom
                );
            }

            if (dateTo) {
                params.append(
                    "date_to",
                    dateTo
                );
            }

            if (status) {
                params.append(
                    "status",
                    status
                );
            }

            const result =
                await request(
                    `/reports?${params.toString()}`
                );

            setData(result.data);
        } catch (err) {
            setError(err.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReport();
    }, [report]);

    function buildExportUrl(type) {
        const params =
            new URLSearchParams();

        params.append(
            "report",
            report
        );

        if (dateFrom) {
            params.append(
                "date_from",
                dateFrom
            );
        }

        if (dateTo) {
            params.append(
                "date_to",
                dateTo
            );
        }

        if (status) {
            params.append(
                "status",
                status
            );
        }

        return `${API}/reports/${type}?${params.toString()}`;
    }

    function exportCsv() {
        window.open(
            buildExportUrl("csv"),
            "_blank"
        );
    }

    function exportPdf() {
        window.open(
            buildExportUrl("pdf"),
            "_blank"
        );
    }

    const rows = data?.rows || [];

    const summaryEntries =
        Object.entries(
            data?.summary || {}
        ).filter(
            ([, value]) =>
                typeof value !== "object"
        );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Reports
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Generate booking, court,
                        financial, membership,
                        waitlist, and operational
                        reports.
                    </p>
                </div>

                {/* Filters */}

                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div className="lg:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Report
                            </label>

                            <select
                                value={report}
                                onChange={(event) =>
                                    setReport(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                {REPORTS.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.value
                                            }
                                            value={
                                                item.value
                                            }
                                        >
                                            {
                                                item.label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date From
                            </label>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date To
                            </label>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">

                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading
                                ? "Generating..."
                                : "Generate Report"}
                        </button>

                        <button
                            onClick={exportCsv}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Export CSV
                        </button>

                        <button
                            onClick={exportPdf}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Export PDF
                        </button>

                    </div>
                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Report title */}

                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {selectedReport?.label}
                    </h2>
                </div>

                {/* Summary */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {summaryEntries.map(
                        ([key, value]) => (
                            <div
                                key={key}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="text-sm text-gray-500">
                                    {titleCase(
                                        key
                                    )}
                                </div>

                                <div className="mt-2 text-2xl font-bold text-gray-900">
                                    {formatValue(
                                        value,
                                        key
                                    )}
                                </div>
                            </div>
                        )
                    )}

                </div>

                {/* Table */}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">
                            Generating report...
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No records found for this
                            report.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(
                                            rows[0]
                                        ).map(
                                            (column) => (
                                                <th
                                                    key={
                                                        column
                                                    }
                                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                                >
                                                    {titleCase(
                                                        column
                                                    )}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">

                                    {rows.map(
                                        (
                                            row,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    row.id ??
                                                    row.booking_id ??
                                                    index
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                {Object.entries(
                                                    row
                                                ).map(
                                                    ([
                                                        key,
                                                        value,
                                                    ]) => (
                                                        <td
                                                            key={
                                                                key
                                                            }
                                                            className="whitespace-nowrap px-4 py-3 text-sm text-gray-700"
                                                        >
                                                            {formatValue(
                                                                value,
                                                                key
                                                            )}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}