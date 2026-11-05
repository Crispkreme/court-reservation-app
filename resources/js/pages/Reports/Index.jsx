import React, { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, Download, FileBarChart, FileSpreadsheet, FileText, RefreshCw, Search, AlertCircle } from "lucide-react";
import Layout from "../../components/layout/Layout";
import TableHead from '../../components/table/TableHead';
import ErrorAlert from "../../components/ErrorAlert";
import { getReport, getReportExportUrl } from "../../services/reportService";
import { REPORT_TYPES, REPORT_TYPE_OPTIONS } from "@/constants/enums";
import { titleCase, formatValues } from "../../utils/formatters";

export default function Reports() {
    const [report, setReport] = useState("daily_booking");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [status, setStatus] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const selectedReport = useMemo(
        () =>
            REPORT_TYPE_OPTIONS.find(
                (item) => item.value === report
            ),
        [report]
    );

    async function loadReport() {
        try {
            setLoading(true);
            setError("");

            const params = {
                report,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                status: status || undefined,
            };

            const response = await getReport(params);

            setData(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load report."
            );

            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReport();
    }, [report]);

    function buildExportUrl(type) {
        return getReportExportUrl(type, {
            report,
            date_from: dateFrom,
            date_to: dateTo,
            status,
        });
    }
    function exportCsv() {
        window.open(buildExportUrl("csv"), "_blank");
    }
    function exportPdf() {
        window.open(buildExportUrl("pdf"), "_blank");
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
        <Layout>
        <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-screen-2xl space-y-6">

                {/* Header */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Reports
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Generate booking, court, financial, membership, waitlist, and operational reports.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadReport}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh Report
                    </button>
                </div>

                {/* Filters */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div className="lg:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Report
                            </label>

                            <select
                                value={report}
                                onChange={(event) =>
                                    setReport(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {REPORT_TYPE_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">

                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><FileBarChart size={16} /> Generate Report</>}
                        </button>

                        <button
                            onClick={exportCsv}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <FileSpreadsheet size={16} /> Export CSV
                        </button>

                        <button
                            onClick={exportPdf}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <FileText size={16} /> Export PDF
                        </button>

                    </div>
                </div>

                <ErrorAlert message={error} />

                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {selectedReport?.label}
                    </h2>
                </div>

                {/* Summary */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {summaryEntries.map(
                        ([key, value]) => (
                            <div
                                key={key}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="text-sm font-medium text-slate-500">
                                    {titleCase(
                                        key
                                    )}
                                </div>

                                <div className="mt-3 text-2xl font-bold text-slate-900">
                                    {formatValues(
                                        value,
                                        key
                                    )}
                                </div>
                            </div>
                        )
                    )}

                </div>

                {/* Table */}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-sm text-slate-500">
                            <RefreshCw size={20} className="animate-spin text-blue-600" />
                            Generating report...
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-sm text-slate-500">
                            No records found for this
                            report.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="min-w-full divide-y divide-slate-200">

                                <thead className="bg-slate-50">
                                    <tr>
                                        {Object.keys(
                                            rows[0]
                                        ).map(
                                            (column) => (
                                                <th
                                                    key={
                                                        column
                                                    }
                                                    className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                >
                                                    {titleCase(
                                                        column
                                                    )}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

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
                                                className="transition hover:bg-slate-50/80"
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
                                                            className="whitespace-nowrap px-5 py-4 text-sm text-slate-700"
                                                        >
                                                            {formatValues(
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
        </Layout>
    );
}