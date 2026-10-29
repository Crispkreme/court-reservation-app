import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import {
  UserRound,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from "lucide-react";

const sections = [
  { id: "profile", label: "Profile", description: "Your account information", icon: UserRound },
  { id: "security", label: "Security", description: "Password and account security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", description: "Choose what updates you receive", icon: Bell },
  { id: "preferences", label: "Preferences", description: "Customize your OnlineCourtReservation experience", icon: SlidersHorizontal },
];

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  role: "Administrator",
};

const initialNotifications = {
  bookingConfirmations: true,
  bookingCancellations: true,
  paymentUpdates: true,
  membershipUpdates: true,
  systemAlerts: true,
  marketingUpdates: false,
};

const initialPreferences = {
  language: "en",
  timezone: "Asia/Dubai",
  dateFormat: "DD/MM/YYYY",
  itemsPerPage: "10",
};

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {description && <span className="mt-1 block text-sm text-slate-500">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const updateProfile = (field, value) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setMessage("");
  };

  const updateNotifications = (field, value) => {
    setNotifications((previous) => ({ ...previous, [field]: value }));
    setMessage("");
  };

  const updatePreferences = (field, value) => {
    setPreferences((previous) => ({ ...previous, [field]: value }));
    setMessage("");
  };

  const resetSection = () => {
    if (activeSection === "profile") setProfile(initialProfile);
    if (activeSection === "notifications") setNotifications(initialNotifications);
    if (activeSection === "preferences") setPreferences(initialPreferences);
    if (activeSection === "security") {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("success");

    if (activeSection === "security") {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessageType("error");
        setMessage("Please complete all password fields.");
        return;
      }
      if (newPassword.length < 8) {
        setMessageType("error");
        setMessage("Your new password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessageType("error");
        setMessage("The new password and confirmation do not match.");
        return;
      }
      setMessageType("info");
      setMessage("The form is validated. Connect this page to your password-update API to save the change.");
      return;
    }

    setMessageType("info");
    setMessage("Your changes are currently held in this page only. Connect your settings API to persist them to your account.");
  };

  const active = sections.find((section) => section.id === activeSection);
  const ActiveIcon = active?.icon || SlidersHorizontal;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <SlidersHorizontal size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your account, security, notifications, and preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div
              role="status"
              className={`mb-5 flex items-start gap-2 rounded-xl border p-4 text-sm ${
                messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : messageType === "info"
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {messageType === "error" ? <Info size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account settings
              </p>
              <nav className="space-y-1" aria-label="Settings sections">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const selected = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(section.id);
                        setMessage("");
                      }}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition ${
                        selected
                          ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={18} className="mt-0.5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{section.label}</span>
                        <span className={`mt-0.5 block text-xs ${selected ? "text-blue-600" : "text-slate-400"}`}>
                          {section.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <main className="min-w-0">
              <form onSubmit={handleSave} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <ActiveIcon size={19} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{active?.label}</h2>
                      <p className="mt-0.5 text-sm text-slate-500">{active?.description}</p>
                    </div>
                  </div>
                </div>

                {activeSection === "profile" && (
                  <div className="space-y-6 p-5 sm:p-6">
                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {profile.name.trim() ? profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() : <UserRound size={24} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{profile.name || "Your name"}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{profile.role || "Account role"}</p>
                        <p className="mt-1 text-xs text-slate-400">Profile details displayed in your account</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="Full name">
                        <input className={inputClass} value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} placeholder="Enter your full name" autoComplete="name" />
                      </Field>
                      <Field label="Email address">
                        <input className={inputClass} type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
                      </Field>
                      <Field label="Phone number">
                        <input className={inputClass} type="tel" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} placeholder="Enter your phone number" autoComplete="tel" />
                      </Field>
                      <Field label="Role" hint="Your role is normally assigned by an administrator.">
                        <input className={`${inputClass} bg-slate-50 text-slate-500`} value={profile.role} readOnly />
                      </Field>
                    </div>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      Use a unique password with at least 8 characters. Password changes will need to be connected to your authentication API.
                    </div>
                    <Field label="Current password">
                      <div className="relative">
                        <input className={`${inputClass} pr-11`} type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="Enter current password" />
                        <button type="button" onClick={() => setShowCurrentPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700" aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}>
                          {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </Field>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="New password" hint="At least 8 characters.">
                        <div className="relative">
                          <input className={`${inputClass} pr-11`} type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Enter new password" />
                          <button type="button" onClick={() => setShowNewPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700" aria-label={showNewPassword ? "Hide new password" : "Show new password"}>
                            {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                      </Field>
                      <Field label="Confirm new password">
                        <input className={inputClass} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Re-enter new password" />
                      </Field>
                    </div>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="divide-y divide-slate-100 px-5 sm:px-6">
                    <Toggle checked={notifications.bookingConfirmations} onChange={(value) => updateNotifications("bookingConfirmations", value)} label="Booking confirmations" description="Receive updates when a booking is confirmed." />
                    <Toggle checked={notifications.bookingCancellations} onChange={(value) => updateNotifications("bookingCancellations", value)} label="Booking cancellations" description="Receive updates when a booking is cancelled." />
                    <Toggle checked={notifications.paymentUpdates} onChange={(value) => updateNotifications("paymentUpdates", value)} label="Payment updates" description="Receive successful payment, failure, and refund updates." />
                    <Toggle checked={notifications.membershipUpdates} onChange={(value) => updateNotifications("membershipUpdates", value)} label="Membership updates" description="Receive membership renewal and expiry reminders." />
                    <Toggle checked={notifications.systemAlerts} onChange={(value) => updateNotifications("systemAlerts", value)} label="System alerts" description="Receive important operational and service notifications." />
                    <Toggle checked={notifications.marketingUpdates} onChange={(value) => updateNotifications("marketingUpdates", value)} label="Product and promotional updates" description="Receive occasional product news and announcements." />
                  </div>
                )}

                {activeSection === "preferences" && (
                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <Field label="Language">
                      <select className={inputClass} value={preferences.language} onChange={(e) => updatePreferences("language", e.target.value)}>
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </Field>
                    <Field label="Time zone">
                      <select className={inputClass} value={preferences.timezone} onChange={(e) => updatePreferences("timezone", e.target.value)}>
                        <option value="Asia/Dubai">Dubai (UTC+04:00)</option>
                        <option value="Asia/Manila">Manila (UTC+08:00)</option>
                        <option value="Europe/London">London</option>
                        <option value="America/New_York">New York</option>
                      </select>
                    </Field>
                    <Field label="Date format">
                      <select className={inputClass} value={preferences.dateFormat} onChange={(e) => updatePreferences("dateFormat", e.target.value)}>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </Field>
                    <Field label="Rows per page">
                      <select className={inputClass} value={preferences.itemsPerPage} onChange={(e) => updatePreferences("itemsPerPage", e.target.value)}>
                        <option value="10">10 rows</option>
                        <option value="25">25 rows</option>
                        <option value="50">50 rows</option>
                        <option value="100">100 rows</option>
                      </select>
                    </Field>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-slate-500">
                    <Info size={14} className="mr-1 inline-block" />
                    Settings changes are not saved to the server yet.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={resetSection} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      <RotateCcw size={16} />
                      Reset
                    </button>
                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
