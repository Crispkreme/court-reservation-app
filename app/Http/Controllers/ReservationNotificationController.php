<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservationNotificationRequest;
use App\Models\ReservationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ReservationNotification::query()
            ->with('user')
            ->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $notifications = $query
            ->paginate($request->integer('per_page', 20));

        return response()->json($notifications);
    }

    public function store(
        StoreReservationNotificationRequest $request
    ): JsonResponse {
        $notification = ReservationNotification::create(
            $request->validated()
        );

        $notification->load('user');

        return response()->json([
            'message' => 'Notification created successfully.',
            'notification' => $notification,
        ], 201);
    }

    public function show(
        ReservationNotification $reservationNotification
    ): JsonResponse {
        $reservationNotification->load('user');

        return response()->json($reservationNotification);
    }

    public function markAsRead(
        ReservationNotification $reservationNotification
    ): JsonResponse {
        $reservationNotification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $reservationNotification->fresh(),
        ]);
    }

    public function markAsUnread(
        ReservationNotification $reservationNotification
    ): JsonResponse {
        $reservationNotification->markAsUnread();

        return response()->json([
            'message' => 'Notification marked as unread.',
            'notification' => $reservationNotification->fresh(),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $query = ReservationNotification::query()
            ->whereNull('read_at');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $count = $query->count();

        $query->update([
            'read_at' => now(),
            'status' => 'read',
        ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
            'count' => $count,
        ]);
    }

    public function destroy(
        ReservationNotification $reservationNotification
    ): JsonResponse {
        $reservationNotification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $query = ReservationNotification::query()
            ->whereNull('read_at');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json([
            'count' => $query->count(),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $query = ReservationNotification::query();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json([
            'total' => (clone $query)->count(),

            'unread' => (clone $query)
                ->whereNull('read_at')
                ->count(),

            'read' => (clone $query)
                ->whereNotNull('read_at')
                ->count(),

            'pending' => (clone $query)
                ->where('status', 'pending')
                ->count(),

            'sent' => (clone $query)
                ->where('status', 'sent')
                ->count(),

            'delivered' => (clone $query)
                ->where('status', 'delivered')
                ->count(),

            'failed' => (clone $query)
                ->where('status', 'failed')
                ->count(),

            'by_type' => (clone $query)
                ->selectRaw('type, COUNT(*) as total')
                ->groupBy('type')
                ->orderByDesc('total')
                ->get(),

            'by_channel' => (clone $query)
                ->selectRaw('channel, COUNT(*) as total')
                ->groupBy('channel')
                ->orderByDesc('total')
                ->get(),
        ]);
    }
}