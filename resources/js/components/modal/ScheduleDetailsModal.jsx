
import { X, MapPin, CalendarDays, Clock } from "lucide-react";

function Detail({ icon, label, wide = false, children }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800">
        {children}
      </div>
    </div>
  );
}

export default function ScheduleDetailsModal({
  selectedEvent,
  setSelectedEvent,
  getCourtName,
}) {
  if (!selectedEvent) return null;

  const closeModal = () => setSelectedEvent(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Schedule Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Information for the selected calendar event.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close schedule details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Details */}
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Detail
            icon={<MapPin size={16} />}
            label="Court"
          >
            {getCourtName(selectedEvent.court_id)}
          </Detail>

          <Detail
            icon={<CalendarDays size={16} />}
            label="Date"
          >
            {selectedEvent.date ?? "—"}
          </Detail>

          <Detail
            icon={<Clock size={16} />}
            label="Time"
          >
            {selectedEvent.start && selectedEvent.end
              ? `${selectedEvent.start} - ${selectedEvent.end}`
              : "Whole Day"}
          </Detail>

          <Detail label="Status">
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
              {selectedEvent.status ?? "available"}
            </span>
          </Detail>

          {selectedEvent.title && (
            <Detail label="Title" wide>
              {selectedEvent.title}
            </Detail>
          )}

          {selectedEvent.reason && (
            <Detail label="Reason" wide>
              {selectedEvent.reason}
            </Detail>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}