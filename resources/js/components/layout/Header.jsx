
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function Header({
  title = "Admin Dashboard",
  onMenuClick,
  onSearch,
  onProfileClick,
  onSettingsClick,
  onLogout,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search handler
  function handleSearch(event) {
    event.preventDefault();
    onSearch?.(search.trim());
  }

  function toggleDropdown(name) {
    setActiveDropdown((current) => (current === name ? null : name));
  }

  function handleAction(callback) {
    setActiveDropdown(null);
    callback?.();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {title}
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">
            Court reservation management
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex"
        >
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            type="search"
            aria-label="Search"
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-32 bg-transparent text-xs outline-none lg:w-44"
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                onSearch?.("");
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={activeDropdown === "notifications"}
            onClick={() => toggleDropdown("notifications")}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {activeDropdown === "notifications" && (
            <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate("/notifications");
                  }}
                  className="text-sm font-semibold text-slate-800 hover:text-blue-600"
                >
                  See Notifications
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="text-slate-400 hover:text-slate-700"
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Welcome to CourtReserve
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Your dashboard is ready.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full rounded-lg py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}

          {/* Profile dropdown */}
          {activeDropdown === "profile" && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">Admin</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <button
                type="button"
                onClick={() => handleAction(onProfileClick)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <User size={16} />
                My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAction(() => navigate("/settings"));
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} />
                Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => handleAction(onLogout)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Admin profile button */}
        <button
          type="button"
          aria-label="Admin profile menu"
          aria-expanded={activeDropdown === "profile"}
          onClick={() => toggleDropdown("profile")}
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            AD
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-slate-800">
              Admin
            </span>
            <span className="block text-[10px] text-slate-500">
              Administrator
            </span>
          </span>

          <ChevronDown
            size={15}
            className={`hidden text-slate-400 transition sm:block ${
              activeDropdown === "profile" ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </header>
  );
}
