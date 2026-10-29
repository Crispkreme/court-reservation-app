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
import CancellationPolicies from './pages/Bookings/CancellationPolicies';

import Members from './pages/Members/Members';
import Players from './pages/Members/Players';
import CreateMembers from './pages/Members/CreateMembers';
import MembersShow from './pages/MemberPlayers/Members/Show';

import PlayersCreate from './pages/Members/CreatePlayers';
import PlayersShow from './pages/MemberPlayers/Players/Show';
import Invitations from './pages/Members/Invitations';
import InvitationsShow from './pages/MemberPlayers/Invitations/Show';
import ParticipantsShow from './pages/MemberPlayers/Participants/Show';
import Memberships from './pages/Members/Memberships';
import Privileges from './pages/Members/Privileges';
import Matchmaking from './pages/Members/Matchmaking';
import Payments from './pages/Payments/Payments';
import TransactionHistory from './pages/Transactions/Index';
import Settings from "./pages/Settings";
import OperationalControls from './pages/OperationalControls/Index';
import Notifications from './pages/Notifications/Index';
import CustomerDashboard from './pages/CustomerDashboard/Index';
import Dashboard from './pages/Dashboard/Index';
import MemberDashboard from './pages/MemberDashboard/Index';
import FailureExceptionsIndex from './pages/FailureExceptions/Index';
import Reports from './pages/Reports/Index';
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
                <Route path="/settings" element={<Settings />} />

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
                <Route path="/bookings/cancellation-policies" element={<ProtectedRoute><CancellationPolicies /></ProtectedRoute>}/>
                <Route path="/booking-participants" element={<ProtectedRoute><BookingParticipants /></ProtectedRoute>}/>

                <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>}/>
                <Route path="/members/create" element={<ProtectedRoute><CreateMembers /></ProtectedRoute>}/>
                <Route path="/members/:id" element={<ProtectedRoute><MembersShow /></ProtectedRoute>}/>
                <Route path="/member/players" element={<ProtectedRoute><Players /></ProtectedRoute>}/>
                <Route path="/members/privileges" element={<ProtectedRoute><Privileges /></ProtectedRoute>}/>
                <Route path="/players/create" element={<ProtectedRoute><PlayersCreate /></ProtectedRoute>}/>
                <Route path="/players/:id" element={<ProtectedRoute><PlayersShow /></ProtectedRoute>}/>
                <Route path="/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>}/>
                <Route path="/invitations/:token" element={<ProtectedRoute><InvitationsShow /></ProtectedRoute>}/>
                <Route path="/members/memberships" element={<ProtectedRoute><Memberships /></ProtectedRoute>}/>
                <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>}/>

                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>}/>
                <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>}/>
                <Route path="/admin/operational-controls" element={<ProtectedRoute><OperationalControls /></ProtectedRoute>}/>
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>
                <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>}/>
                <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
                <Route path="/member-dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>}/>
                <Route path="/failure-exceptions" element={<ProtectedRoute><FailureExceptionsIndex /></ProtectedRoute>}/>
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>}/>
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