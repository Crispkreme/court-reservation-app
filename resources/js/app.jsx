
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import { AuthProvider } from "@context/AuthContext";

// Public Pages
import LandingPage from "@pages/Index";
import Login from "@pages/Auth/Login";
import Register from "@pages/Auth/Register";

// Layout
import Layout from "@components/layout/Index";
import ProtectedRoute from "@components/layout/ProtectedRoute";

// Admin Pages
import AdminDashboard from "@pages/Admin/Dashboard";
import AdminSportCategories from "@pages/Admin/SportCategory/Index";
import AdminCourt from "@pages/Admin/Court/Index";
import AdminCourtMaintenance from "@pages/Admin/Court/maintenance/Index";
import AdminCourtUtilization from "@pages/Admin/Court/Utilization/Index";
import AdminCourtSchedule from "@/pages/Admin/Court/CourtSchedule/Index";
import AdminCourtRecurringSchedule from "@/pages/Admin/Court/CourtRecurringSchedule/Index";

// Member Pages
import MemberDashboard from "@pages/Member/Dashboard";
import MemberCourtIndex from "@pages/Member/Court/Index";
import MemberCourtShow from "@pages/Member/Court/Show";
import MemberCourtSchedule from "@/pages/Member/Court/CourtSchedule/Index";
import MemberCourtUtilization from "@pages/Member/Court/Utilization/Index";

// Navigation
import { adminMenu, memberMenu } from "@config/navigation";

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route
                    path="/admin"
                    element={
                        <Layout
                            basePath="/admin"
                            title="CourtBook Admin"
                            menuItems={adminMenu}
                        />
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />}/>
                    <Route path="dashboard" element={<AdminDashboard />}/>
                    <Route path="sport-categories" element={<AdminSportCategories />}/>
                    <Route path="courts" element={<AdminCourt />} />
                    <Route path="court-maintenance" element={<AdminCourtMaintenance />} />
                    <Route path="court-utilization" element={<AdminCourtUtilization />} />
                    <Route path="court-schedules" element={<AdminCourtSchedule />} />
                    <Route path="court-recurring-schedules" element={<AdminCourtRecurringSchedule />} />
                </Route>
            </Route>

            {/* Member Routes */}
            <Route element={<ProtectedRoute allowedRole="member" />}>
                <Route
                    path="/member"
                    element={
                        <Layout
                            basePath="/member"
                            title="CourtBook"
                            menuItems={memberMenu}
                        />
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<MemberDashboard />} />
                    <Route path="courts" element={<MemberCourtIndex />} />
                    <Route path="courts/:id" element={<MemberCourtShow />} />
                    <Route path="court-utilization" element={<MemberCourtUtilization />}/>
                    <Route path="court-schedules" element={<MemberCourtSchedule />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

const container = document.getElementById("app");

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}