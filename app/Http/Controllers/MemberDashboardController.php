<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Transaction;
use App\Models\Waitlist;
use App\Models\Membership;

class MemberDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookingQuery = Booking::query()->where('user_id', $user->id);
        $totalBookings = (clone $bookingQuery)->count();
        $bookingStatuses = (clone $bookingQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $bookingStatus = [
            'confirmed' => (int) ($bookingStatuses['confirmed'] ?? 0),
            'pending' => (int) ($bookingStatuses['pending'] ?? 0),
            'cancelled' => (int) ($bookingStatuses['cancelled'] ?? 0),
            'completed' => (int) ($bookingStatuses['completed'] ?? 0),
            'failed' => (int) ($bookingStatuses['failed'] ?? 0),
        ];

        $upcomingSessions = (clone $bookingQuery)
            ->where(function ($query) {
                $query
                    ->whereDate('booking_date', '>', today())
                    ->orWhere(function ($query) {
                        $query
                            ->whereDate('booking_date', today())
                            ->where(
                                'start_time',
                                '>=',
                                now()->format('H:i:s')
                            );
                    });
            })
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->with(['court', 'sportCategory'])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        $recentBookings = (clone $bookingQuery)
            ->with(['court', 'sportCategory'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $availableCourts = Court::query()
            ->where('status', 'available')
            ->with('sportCategory')
            ->orderBy('name')
            ->limit(10)
            ->get();

        $waitlistActivity = [
            'total' => 0,
            'waiting' => 0,
            'promoted' => 0,
            'cancelled' => 0,
            'expired' => 0,
        ];

        if (class_exists(Waitlist::class)) {
            $waitlistStatuses = Waitlist::query()
                ->where('user_id', $user->id)
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $waitlistActivity['total'] =
                (int) $waitlistStatuses->sum();

            foreach (
                ['waiting', 'promoted', 'cancelled', 'expired'] as $status
            ) {
                $waitlistActivity[$status] =
                    (int) ($waitlistStatuses[$status] ?? 0);
            }
        }

        $membership = null;

        if (class_exists(Membership::class)) {
            $membership = Membership::query()
                ->where('user_id', $user->id)
                ->latest('created_at')
                ->first();
        }

        return response()->json([
            'summary' => [
                'total_bookings' => $totalBookings,
                'confirmed' => $bookingStatus['confirmed'],
                'pending' => $bookingStatus['pending'],
                'cancelled' => $bookingStatus['cancelled'],
                'completed' => $bookingStatus['completed'],
                'failed' => $bookingStatus['failed'],
            ],

            'booking_status' => $bookingStatus,

            'upcoming_sessions' => $upcomingSessions,

            'recent_bookings' => $recentBookings,
            'available_courts' => $availableCourts,
            'waitlist_activity' => $waitlistActivity,
            'membership' => $membership,
        ]);
    }
}