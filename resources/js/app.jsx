import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import CourtManagement from './pages/Courts/CourtManagement';

import CourtSchedules from './pages/CourtScheduling/Schedules';
import CourtScheduleOverrides from './pages/CourtScheduling/Overrides';
import CourtCalendar from './pages/CourtScheduling/Calendar';

import Booking from './pages/Bookings/Index';
import Reschedule from './pages/Bookings/Reschedule';
import BookingHolds from './pages/BookingHolds/Index';
import BookingStatus from './pages/BookingStatus/Index';
import BookingRules from './pages/BookingRules/Index';
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
import AdminDashboard from './pages/AdminDashboard/Index';

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

                {/*
                |--------------------------------------------------------------------------
                | Public Routes
                |--------------------------------------------------------------------------
                */}

                <Route path="/login" element={<Login />}/>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />}/>

                {/*
                |--------------------------------------------------------------------------
                | Court Management
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/courts"
                    element={
                        <ProtectedRoute>
                            <CourtManagement />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Court Scheduling
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/court-scheduling/schedules"
                    element={
                        <ProtectedRoute>
                            <CourtSchedules />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/court-scheduling/overrides"
                    element={
                        <ProtectedRoute>
                            <CourtScheduleOverrides />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/court-scheduling/calendar"
                    element={
                        <ProtectedRoute>
                            <CourtCalendar />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Bookings
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/bookings"
                    element={
                        <ProtectedRoute>
                            <Booking />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bookings/:id/reschedule"
                    element={
                        <ProtectedRoute>
                            <Reschedule />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bookings/:id/participants"
                    element={
                        <ProtectedRoute>
                            <ParticipantsShow />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/booking-holds"
                    element={
                        <ProtectedRoute>
                            <BookingHolds />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/booking-status"
                    element={
                        <ProtectedRoute>
                            <BookingStatus />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/booking-rules"
                    element={
                        <ProtectedRoute>
                            <BookingRules />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cancellation-policies"
                    element={
                        <ProtectedRoute>
                            <CancellationPolicies />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Members
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/members"
                    element={
                        <ProtectedRoute>
                            <MembersIndex />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/members/create"
                    element={
                        <ProtectedRoute>
                            <MembersCreate />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/members/:id"
                    element={
                        <ProtectedRoute>
                            <MembersShow />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Players
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/players"
                    element={
                        <ProtectedRoute>
                            <PlayersIndex />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/players/create"
                    element={
                        <ProtectedRoute>
                            <PlayersCreate />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/players/:id"
                    element={
                        <ProtectedRoute>
                            <PlayersShow />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Player Invitations
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/invitations"
                    element={
                        <ProtectedRoute>
                            <InvitationsIndex />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/invitations/:token"
                    element={
                        <ProtectedRoute>
                            <InvitationsShow />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Memberships
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/memberships"
                    element={
                        <ProtectedRoute>
                            <Memberships />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/membership-privileges"
                    element={
                        <ProtectedRoute>
                            <MembershipPrivileges />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Matchmaking
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/matchmaking"
                    element={
                        <ProtectedRoute>
                            <Matchmaking />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Payments
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/payments"
                    element={
                        <ProtectedRoute>
                            <PaymentIndex />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <TransactionHistory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/outstanding-payments"
                    element={
                        <ProtectedRoute>
                            <OutstandingPayments />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Operational Controls
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/admin/operational-controls"
                    element={
                        <ProtectedRoute>
                            <OperationalControls />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Notifications
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Customer Dashboard
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/customer-dashboard"
                    element={
                        <ProtectedRoute>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Admin Dashboard
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Failure Exceptions
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/failure-exceptions"
                    element={
                        <ProtectedRoute>
                            <FailureExceptionsIndex />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Reports
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <ReportsIndex />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Audit History
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/audit-history"
                    element={
                        <ProtectedRoute>
                            <AuditHistoryIndex />
                        </ProtectedRoute>
                    }
                />


                {/*
                |--------------------------------------------------------------------------
                | Default Route
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/courts"
                            replace
                        />
                    }
                />

                {/*
                |--------------------------------------------------------------------------
                | 404 / Unknown Route
                |--------------------------------------------------------------------------
                */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}


/*
|--------------------------------------------------------------------------
| Application Bootstrap
|--------------------------------------------------------------------------
*/

createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);