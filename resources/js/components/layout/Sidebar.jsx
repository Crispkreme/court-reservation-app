
import { NavLink } from "react-router-dom";
import { CalendarDays, X } from "lucide-react";

export default function Sidebar({
    isOpen = false,
    onClose = () => {},
    basePath = "",
    menuItems = [],
}) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                id="portal-sidebar"
                aria-label="Main navigation"
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex w-64 flex-col
                    bg-[#450A0A] text-white
                    shadow-xl
                    transition-transform duration-300
                    lg:translate-x-0 lg:shadow-none
                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                {/* Branding */}
                <div className="flex min-h-20 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600">
                            <CalendarDays
                                size={24}
                                className="text-white"
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold tracking-tight text-white">
                                CourtBook
                            </h1>

                            <p className="truncate text-xs text-red-200">
                                Court Reservation System
                            </p>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                        className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/10 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-6">
                    <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
                        Main Menu
                    </p>

                    <div className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            if (item.enabled === false) {
                                return (
                                    <div
                                        key={item.path ?? item.label}
                                        title="Coming soon"
                                        aria-disabled="true"
                                        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-200/50"
                                    >
                                        {Icon && <Icon size={19} />}
                                        <span>{item.label}</span>
                                    </div>
                                );
                            }

                            const path = item.path.startsWith("/")
                                ? item.path
                                : `${basePath}/${item.path}`;

                            return (
                                <NavLink
                                    key={path}
                                    to={path}
                                    end={item.end ?? false}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? "bg-red-600 text-white shadow-sm"
                                                : "text-red-100/80 hover:bg-white/10 hover:text-white"
                                        }`
                                    }
                                >
                                    {Icon && (
                                        <Icon
                                            size={19}
                                            className="shrink-0"
                                        />
                                    )}

                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="shrink-0 border-t border-white/10 px-5 py-5">
                    <p className="text-sm font-semibold text-white">
                        CourtBook
                    </p>

                    <p className="mt-1 text-xs text-red-200/70">
                        Book your court. Play your game.
                    </p>
                </div>
            </aside>
        </>
    );
}