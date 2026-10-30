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
  UserRound,
  FileText,
  ReceiptText,
  UserPlus,
  Mail,
  ShieldCheck,
  Bike,
  CalendarX,
  Network,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Bookings",
    to: "/bookings",
    icon: CalendarDays,
    children: [
      { label: "All Bookings", to: "/bookings", icon: CalendarCheck },
      { label: "Participants", to: "/bookings/participants", icon: Users },
      { label: "Booking Holds", to: "/booking-holds", icon: CalendarClock },
      { label: "Booking Status", to: "/booking-status", icon: Activity },
      { label: "Booking Rules", to: "/booking-rules", icon: ClipboardList },
      { label: "Booking Cancellations", to: "/bookings/cancellation-policies", icon: CalendarX },
    ],
  },
  {
    label: "Sports",
    to: "/sport/categories",
    icon: Bike,
  },
  {
    label: "Courts",
    to: "/courts",
    icon: Trophy,
    children: [
      { label: "Court", to: "/courts", icon: Trophy },
      { label: "Schedules", to: "/courts/schedules", icon: CalendarDays },
      { label: "Schedule Overrides", to: "/courts/overrides", icon: ClipboardList },
      { label: "Court Calendar", to: "/courts/calendar", icon: Calendar },
    ],
  },
  {
    label: "Members",
    to: "/members",
    icon: Users,
    children: [
      { label: "Members", to: "/members", icon: UserRound },
      { label: "Players", to: "/members/players", icon: UserPlus },
      { label: "Cancellation Policies", to: "/cancellation-policies", icon: FileText },
      { label: "Invitations", to: "/invitations", icon: Mail },
      { label: "Memberships", to: "/members/memberships", icon: CreditCard },
      { label: "Privileges", to: "/members/privileges", icon: ShieldCheck },
      { label: "Matchmaking", to: "/matchmaking", icon: Network },
    ],
  },
  { label: "Payments", to: "/payments", icon: CreditCard },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Transactions", to: "/transactions", icon: ReceiptText },
];

const pathMatches = (pathname, path) =>
  pathname === path || pathname.startsWith(`${path}/`);

export default function Sidebar({ collapsed, onToggle, onNavigate }) {
  const location = useLocation();

  const isBookingsRoute =
    location.pathname === "/bookings" ||
    location.pathname.startsWith("/bookings/") ||
    location.pathname.startsWith("/booking-holds") ||
    location.pathname.startsWith("/booking-status") ||
    location.pathname.startsWith("/booking-rules") ||
    location.pathname.startsWith("/booking-participants");

  const isCourtsRoute = location.pathname === "/courts" ||
    location.pathname.startsWith("/courts/");

  const isMembersRoute =
    location.pathname === "/members" ||
    location.pathname.startsWith("/members/") ||
    location.pathname === "/cancellation-policies" ||
    location.pathname.startsWith("/cancellation-policies/") ||
    location.pathname.startsWith("/invitations") ||
    location.pathname.startsWith("/matchmaking");

  const [openMenus, setOpenMenus] = useState({
    Bookings: isBookingsRoute,
    Courts: isCourtsRoute,
    Members: isMembersRoute,
  });

  useEffect(() => {
    setOpenMenus((current) => ({
      ...current,
      Bookings: isBookingsRoute ? true : current.Bookings,
      Courts: isCourtsRoute ? true : current.Courts,
      Members: isMembersRoute ? true : current.Members,
    }));
  }, [location.pathname, isBookingsRoute, isCourtsRoute, isMembersRoute]);

  const isActive = (to) => {
    if (to === "/bookings") {
      return location.pathname === "/bookings";
    }
    if (to === "/courts") {
      return location.pathname === "/courts";
    }
    if (to === "/members") {
      return location.pathname === "/members";
    }
    return location.pathname === to;
  };

  const isChildActive = (to, label) => {
    if (label === "All Bookings") return location.pathname === "/bookings";
    if (label === "Court") return location.pathname === "/courts";
    if (label === "Members") return location.pathname === "/members";
    return pathMatches(location.pathname, to);
  };

  const toggleMenu = (label) => {
    if (collapsed) {
      onToggle?.();
      setOpenMenus((current) => ({ ...current, [label]: true }));
      return;
    }
    setOpenMenus((current) => ({ ...current, [label]: !current[label] }));
  };

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${
          collapsed ? "justify-center px-2" : "gap-3 px-5"
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Trophy size={19} />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">OnlineCourtReservation</p>
            <p className="truncate text-xs text-slate-500">Management System</p>
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
          const active = children
            ? (label === "Bookings" ? isBookingsRoute :
              label === "Courts" ? isCourtsRoute :
              label === "Members" ? isMembersRoute : false)
            : isActive(to);

          if (children) {
            const expanded = Boolean(openMenus[label]);

            return (
              <div key={label}>
                <button
                  type="button"
                  title={collapsed ? label : undefined}
                  aria-expanded={!collapsed && expanded}
                  onClick={() => toggleMenu(label)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
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
                        className={`shrink-0 transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && expanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {children.map(({ label: childLabel, to: childTo, icon: ChildIcon }) => {
                      const childActive = isChildActive(childTo, childLabel);

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
                          <span className="min-w-0 flex-1">{childLabel}</span>
                          {childActive && (
                            <span className="h-4 w-1 shrink-0 rounded-full bg-blue-600" />
                          )}
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
              className={({ isActive: linkActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  linkActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <NavLink
          to="/settings"
          title={collapsed ? "Settings" : undefined}
          onClick={onNavigate}
          className={({ isActive: linkActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              linkActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
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
              <p className="truncate text-xs font-semibold text-slate-800">Admin User</p>
              <p className="truncate text-[11px] text-slate-500">Administrator</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="mt-3 hidden w-full items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </aside>
  );
}
