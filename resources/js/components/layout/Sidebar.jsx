import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  CalendarDays,
  ClipboardList,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarCheck,
  CalendarClock,
  Activity,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Bookings",
    to: "/bookings",
    icon: CalendarDays,
    children: [
      { label: "All Bookings", to: "/bookings", icon: CalendarCheck },
      { label: "Participants", to: "/booking-participants", icon: Users },
      { label: "Booking Holds", to: "/booking-holds", icon: CalendarClock },
      { label: "Booking Status", to: "/booking-status", icon: Activity },
      { label: "Booking Rules", to: "/booking-rules", icon: ClipboardList },
    ],
  },
  
{
  label: "Courts",
  to: "/courts",
  icon: Trophy,
  children: [
    {
      label: "Court",
      to: "/courts",
      icon: Trophy,
    },
    {
      label: "Schedules",
      to: "/courts/schedules",
      icon: CalendarDays,
    },
    {
      label: "Schedule Overrides",
      to: "/courts/overrides",
      icon: ClipboardList,
    },
    {
      label: "Court Calendar",
      to: "/courts/calendar",
      icon: Calendar,
    },
  ],
},

  { label: "Members", to: "/memberships", icon: Users },
  { label: "Payments", to: "/payments", icon: CreditCard },
  { label: "Reports", to: "/reports", icon: BarChart3 },
];

export default function Sidebar({ collapsed, onToggle, onNavigate }) {
  const location = useLocation();

  const isBookingsRoute =
    location.pathname === "/bookings" ||
    location.pathname.startsWith("/bookings/") ||
    location.pathname.startsWith("/booking-holds") ||
    location.pathname.startsWith("/booking-status") ||
    location.pathname.startsWith("/booking-rules") ||
    location.pathname.startsWith("/booking-participants");

  const [bookingsOpen, setBookingsOpen] = useState(isBookingsRoute);

  useEffect(() => {
    if (isBookingsRoute) {
      setBookingsOpen(true);
    }
  }, [location.pathname]);

  const isActive = (to) => {
    if (to === "/bookings") {
      return location.pathname === "/bookings" ||
        location.pathname.startsWith("/bookings/");
    }

    return location.pathname === to ||
      location.pathname.startsWith(`${to}/`);
  };

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div
        className={`flex h-16 items-center border-b border-slate-200 ${
          collapsed ? "justify-center px-2" : "gap-3 px-5"
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Trophy size={19} />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              CourtEase
            </p>
            <p className="truncate text-xs text-slate-500">
              Management System
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Main menu
          </p>
        )}

        {navigation.map(({ label, to, icon: Icon, children }) => {
          const active = isActive(to);

          if (children) {
            return (
              <div key={label}>
                <button
                  type="button"
                  title={collapsed ? label : undefined}
                  onClick={() => {
                    if (collapsed) {
                      onToggle();
                      setBookingsOpen(true);
                    } else {
                      setBookingsOpen((open) => !open);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={18} className="shrink-0" />

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          bookingsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && bookingsOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {children.map(({ label: childLabel, to: childTo, icon: ChildIcon }) => {
                      const childActive =
                        childTo === "/bookings"
                          ? location.pathname === "/bookings"
                          : childTo === "/booking-participants"
                            ? location.pathname.startsWith("/booking-participants")
                            : location.pathname === childTo ||
                              location.pathname.startsWith(`${childTo}/`);

                      return (
                        <NavLink
                          key={childLabel}
                          to={childTo}
                          onClick={onNavigate}
                          className={() =>
                            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                              childActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`
                          }
                        >
                          <ChildIcon size={16} className="shrink-0" />
                          <span>{childLabel}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={label}
              to={to}
              title={collapsed ? label : undefined}
              onClick={onNavigate}
              className={() =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
              {active && !collapsed && (
                <span className="h-5 w-1 rounded-full bg-blue-600" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <NavLink
          to="/settings"
          title={collapsed ? "Settings" : undefined}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && "Settings"}
        </NavLink>

        <div
          className={`mt-3 flex items-center rounded-xl bg-slate-50 p-2 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            AD
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                Admin User
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Administrator
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="mt-3 hidden w-full items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </aside>
  );
}