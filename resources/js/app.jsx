import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Court from './pages/Courts/Court';
import CourtSchedules from './pages/Courts/Schedules';
import CourtScheduleOverrides from './pages/Courts/Overrides';
import CourtCalendar from './pages/Courts/Calendar';
import Booking from './pages/Bookings/Index';
import CreateBooking from './pages/Bookings/CreateBooking';
import BookingRules from './pages/Bookings/BookingRules';
import Reschedule from './pages/Bookings/Reschedule';
import BookingHolds from './pages/Bookings/BookingHolds';
import BookingStatus from './pages/Bookings/BookingStatus';
import BookingParticipants from './pages/Bookings/BookingParticipants';
import CancellationPolicies from './pages/CancellationPolicies/Index';
import MembersIndex from './pages/MemberPlayers/Members/Index';
import MembersCreate from './pages/MemberPlayers/Members/Create';
import MembersShow from './pages/MemberPlayers/Members/Show';
import PlayersIndex from './pages/MemberPlayers/Players/Index';
import PlayersCreate from './pages/MemberPlayers/Players/Create';
import PlayersShow from './pages/MemberPlayers/Players/Show';
import InvitationsIndex from './pages/MemberPlayers/Invitations/Index';
import InvitationsShow from './pages/MemberPlayers/Invitations/Show';
import ParticipantsShow from './pages/MemberPlayers/Participants/Show';
import Memberships from './pages/Memberships/Index';
import MembershipPrivileges from './pages/MembershipPrivileges/Index';
import Matchmaking from './pages/Matchmaking/Index';
import PaymentIndex from './pages/Payments/Index';
import TransactionHistory from './pages/Transactions/Index';
import OutstandingPayments from './pages/OutstandingPayments/Index';
import OperationalControls from './pages/OperationalControls/Index';
import Notifications from './pages/Notifications/Index';
import CustomerDashboard from './pages/CustomerDashboard/Index';
import Dashboard from './pages/Dashboard/Index';
import MemberDashboard from './pages/MemberDashboard/Index';
import FailureExceptionsIndex from './pages/FailureExceptions/Index';
import ReportsIndex from './pages/Reports/Index';
import AuditHistoryIndex from './pages/AuditHistory/Index';
import Home from "./pages/Home";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />}/>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />}/>

                <Route path="/courts" element={<ProtectedRoute><Court /></ProtectedRoute>}/>
                <Route path="/courts/schedules" element={<ProtectedRoute><CourtSchedules /></ProtectedRoute>}/>
                <Route path="/courts/overrides" element={<ProtectedRoute><CourtScheduleOverrides /></ProtectedRoute>}/>
                <Route path="/courts/calendar" element={<ProtectedRoute><CourtCalendar /></ProtectedRoute>}/>

                <Route path="/bookings" element={<ProtectedRoute><Booking /></ProtectedRoute>}/>
                <Route path="/bookings/create" element={<ProtectedRoute><CreateBooking /></ProtectedRoute>}/>
                <Route path="/bookings/:id/reschedule" element={<ProtectedRoute><Reschedule /></ProtectedRoute>}/>
                <Route path="/bookings/:id/participants" element={<ProtectedRoute><ParticipantsShow /></ProtectedRoute>}/>
                <Route path="/booking-holds" element={<ProtectedRoute><BookingHolds /></ProtectedRoute>}/>
                <Route path="/booking-status" element={<ProtectedRoute><BookingStatus /></ProtectedRoute>}/>
                <Route path="/booking-rules" element={<ProtectedRoute><BookingRules /></ProtectedRoute>}/>
                <Route path="/booking-participants" element={<ProtectedRoute><BookingParticipants /></ProtectedRoute>}/>

                <Route path="/cancellation-policies" element={<ProtectedRoute><CancellationPolicies /></ProtectedRoute>}/>
                <Route path="/members" element={<ProtectedRoute><MembersIndex /></ProtectedRoute>}/>
                <Route path="/members/create" element={<ProtectedRoute><MembersCreate /></ProtectedRoute>}/>
                <Route path="/members/:id" element={<ProtectedRoute><MembersShow /></ProtectedRoute>}/>
                <Route path="/players" element={<ProtectedRoute><PlayersIndex /></ProtectedRoute>}/>
                <Route path="/players/create" element={<ProtectedRoute><PlayersCreate /></ProtectedRoute>}/>
                <Route path="/players/:id" element={<ProtectedRoute><PlayersShow /></ProtectedRoute>}/>
                <Route path="/invitations" element={<ProtectedRoute><InvitationsIndex /></ProtectedRoute>}/>
                <Route path="/invitations/:token" element={<ProtectedRoute><InvitationsShow /></ProtectedRoute>}/>
                <Route path="/memberships" element={<ProtectedRoute><Memberships /></ProtectedRoute>}/>
                <Route path="/membership-privileges" element={<ProtectedRoute><MembershipPrivileges /></ProtectedRoute>}/>
                <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>}/>

                <Route path="/payments" element={<ProtectedRoute><PaymentIndex /></ProtectedRoute>}/>
                <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>}/>
                <Route path="/outstanding-payments" element={<ProtectedRoute><OutstandingPayments /></ProtectedRoute>}/>
                <Route path="/admin/operational-controls" element={<ProtectedRoute><OperationalControls /></ProtectedRoute>}/>
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>
                <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>}/>
                <Route path="/admin-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
                <Route path="/member-dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>}/>
                <Route path="/failure-exceptions" element={<ProtectedRoute><FailureExceptionsIndex /></ProtectedRoute>}/>
                <Route path="/reports" element={<ProtectedRoute><ReportsIndex /></ProtectedRoute>}/>
                <Route path="/audit-history" element={<ProtectedRoute><AuditHistoryIndex /></ProtectedRoute>}/>
                <Route path="/" element={<Navigate to="/courts" replace/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);