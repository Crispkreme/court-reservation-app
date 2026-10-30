import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, CalendarDays, CalendarCheck, Eye, Pencil, XCircle, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Layout from "../../components/layout/Layout";
import StatusBadge from "../../components/StatusBadge";
import { getBookings } from "../../services/bookingService";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters";
import SummaryCard from "../../components/SummaryCard";

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

export default function Bookings() {

  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 5;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBookings({page: 1,per_page: 100});

      setBookings(response?.data || []);
      setPagination(response);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setError(error.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
        const bookingId = String(booking.booking_reference || "");
        const customer = String(booking.customer_name || "");
        const email = String(booking.customer_email || "");
        const court = String(booking.court?.name || "");
        const sport = String(booking.sport_category?.name || "");
        const bookingStatus = String(booking.status || "").toLowerCase();
        const bookingDate = String(booking.booking_date || "").slice(0, 10);

        const matchesSearch =
            bookingId.toLowerCase().includes(query) ||
            customer.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            court.toLowerCase().includes(query) ||
            sport.toLowerCase().includes(query);

        const matchesStatus =
            !status || bookingStatus === status.toLowerCase();

        const matchesDate = !date || bookingDate === date;

        return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, status, date]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setDate("");
    setPage(1);
  };

  const handleAction = (action, booking) => {
    console.log(`${action} booking:`, booking.id);
  };

  return (
    <>
      <Layout title="Bookings">
        <div className="mx-auto w-full max-w-[1800px] space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarCheck size={24} /></div>
                <div>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Bookings</h1>
                  <p className="mt-1 text-sm text-slate-500">Manage and monitor all court reservations.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/bookings/create")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus size={17} />
                Create Booking
              </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <SummaryCard
              title="Total Bookings"
              value={bookings.length}
              icon="calendar"
              accentColor="bg-blue-500"
            />

            <SummaryCard
              title="Confirmed"
              value={bookings.filter(
                (b) => b.status?.toLowerCase() === "confirmed"
              ).length}
              icon="calendar"
              accentColor="bg-emerald-500"
            />

            <SummaryCard
              title="Pending"
              value={bookings.filter(
                (b) => b.status?.toLowerCase() === "pending"
              ).length}
              icon="calendar"
              accentColor="bg-amber-500"
            />

            <SummaryCard
              title="Cancelled"
              value={bookings.filter(
                (b) => b.status?.toLowerCase() === "cancelled"
              ).length}
              icon="calendar"
              accentColor="bg-rose-500"
            />
          </div>

          {/* Search and filters */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Filter Bookings
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="block xl:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Search
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <Search size={17} className="shrink-0 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Booking ID, customer, or court..."
                    className="w-full min-w-0 border-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              <FilterSelect
                label="Booking Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </FilterSelect>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Booking Date
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <CalendarDays size={16} className="shrink-0 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full min-w-0 bg-transparent py-2.5 text-sm text-slate-700 outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </section>

          {/* Bookings table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  All Bookings
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  View and manage court reservation records.
                </p>
              </div>

              <span className="text-xs text-slate-500">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""} found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Booking ID",
                      "Customer",
                      "Court / Sport",
                      "Date & Time",
                      "Amount",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4">{booking.booking_reference}</td>
                      <td className="px-5 py-4">{booking.customer_name}</td>
                      <td className="px-5 py-4">{booking.court?.name || "—"}</td>
                      <td className="px-5 py-4">{formatDate(booking.booking_date)}</td>
                      <td className="px-5 py-4">{formatCurrency(booking.total_amount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500">
                Showing{" "}
                {filteredBookings.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                {" "}to{" "}
                {Math.min(currentPage * pageSize, filteredBookings.length)}
                {" "}of {filteredBookings.length} results
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}