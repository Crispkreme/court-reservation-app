
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  CalendarDays,
  CalendarCheck,
  Eye,
  Pencil,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import Layout from "../../components/layout/Layout";

const initialBookings = [
  {
    id: "BK-1001",
    customer: "John Smith",
    email: "john@example.com",
    court: "Court 1",
    sport: "Badminton",
    date: "2026-10-29",
    time: "09:00 AM",
    amount: 120,
    status: "confirmed",
  },
  {
    id: "BK-1002",
    customer: "Maria Santos",
    email: "maria@example.com",
    court: "Court 2",
    sport: "Basketball",
    date: "2026-10-29",
    time: "11:00 AM",
    amount: 250,
    status: "pending",
  },
  {
    id: "BK-1003",
    customer: "David Johnson",
    email: "david@example.com",
    court: "Court 3",
    sport: "Tennis",
    date: "2026-10-28",
    time: "02:00 PM",
    amount: 180,
    status: "completed",
  },
  {
    id: "BK-1004",
    customer: "Anna Garcia",
    email: "anna@example.com",
    court: "Court 1",
    sport: "Badminton",
    date: "2026-10-27",
    time: "04:00 PM",
    amount: 120,
    status: "cancelled",
  },
  {
    id: "BK-1005",
    customer: "Michael Lee",
    email: "michael@example.com",
    court: "Court 4",
    sport: "Volleyball",
    date: "2026-10-29",
    time: "06:00 PM",
    amount: 300,
    status: "confirmed",
  },
];

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-blue-50 text-blue-700 ring-blue-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        statusStyles[status] || "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

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
  const [bookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 5;

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.court.toLowerCase().includes(query);

      const matchesStatus = !status || booking.status === status;
      const matchesDate = !date || booking.date === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, status, date]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / pageSize)
  );

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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const formatDate = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const handleAction = (action, booking) => {
    // Connect these actions to your React Router pages or API.
    console.log(`${action} booking:`, booking.id);
  };

  return (
    <Layout title="Bookings">
      <div className="mx-auto w-full max-w-[1800px] space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarCheck size={24} />
              </div>
              <div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Bookings
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage and monitor all court reservations.
                </p>
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
          {[
            {
              label: "Total Bookings",
              value: bookings.length,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Confirmed",
              value: bookings.filter((b) => b.status === "confirmed").length,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Pending",
              value: bookings.filter((b) => b.status === "pending").length,
              color: "text-amber-600 bg-amber-50",
            },
            {
              label: "Cancelled",
              value: bookings.filter((b) => b.status === "cancelled").length,
              color: "text-rose-600 bg-rose-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
                <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            </div>
          ))}
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
                  <tr
                    key={booking.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {booking.id}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm font-medium text-slate-800">
                        {booking.customer}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm font-medium text-slate-800">
                        {booking.court}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.sport}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm text-slate-700">
                        {formatDate(booking.date)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.time}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                      {formatCurrency(booking.amount)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View booking"
                          aria-label={`View ${booking.id}`}
                          onClick={() => handleAction("View", booking)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          title="Edit booking"
                          aria-label={`Edit ${booking.id}`}
                          onClick={() => handleAction("Edit", booking)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Cancel booking"
                          aria-label={`Cancel ${booking.id}`}
                          onClick={() => handleAction("Cancel", booking)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Search size={20} className="text-slate-400" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No bookings found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
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
  );
}
