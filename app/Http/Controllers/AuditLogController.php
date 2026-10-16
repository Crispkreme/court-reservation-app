<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\AuditLogIndexRequest;

class AuditLogController extends Controller
{
    public function index(AuditLogIndexRequest $request): JsonResponse
    {
        $query = AuditLog::query()
            ->with([
                'user:id,name,email',
            ]);

        if ($request->filled('module')) {
            $query->where(
                'module',
                $request->module
            );
        }

        if ($request->filled('action')) {
            $query->where(
                'action',
                $request->action
            );
        }

        if ($request->filled('user_id')) {
            $query->where(
                'user_id',
                $request->user_id
            );
        }

        if ($request->filled('auditable_type')) {
            $query->where(
                'auditable_type',
                $request->auditable_type
            );
        }

        if ($request->filled('auditable_id')) {
            $query->where(
                'auditable_id',
                $request->auditable_id
            );
        }

        if ($request->filled('date_from')) {
            $query->whereDate(
                'created_at',
                '>=',
                $request->date_from
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                'created_at',
                '<=',
                $request->date_to
            );
        }

        $perPage = min(
            max(
                (int) $request->get(
                    'per_page',
                    25
                ),
                1
            ),
            100
        );

        $logs = $query
            ->latest('created_at')
            ->paginate($perPage);

        return response()->json($logs);
    }

    public function show(
        AuditLog $auditLog
    ): JsonResponse {
        $auditLog->load([
            'user:id,name,email',
        ]);

        return response()->json([
            'data' => $auditLog,
        ]);
    }

    public function summary(
        Request $request
    ): JsonResponse {
        $query = AuditLog::query();

        if ($request->filled('date_from')) {
            $query->whereDate(
                'created_at',
                '>=',
                $request->date_from
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                'created_at',
                '<=',
                $request->date_to
            );
        }

        $logs = $query->get();

        return response()->json([
            'total' => $logs->count(),

            'created' =>
                $logs
                    ->where('action', 'created')
                    ->count(),

            'updated' =>
                $logs
                    ->where('action', 'updated')
                    ->count(),

            'deleted' =>
                $logs
                    ->where('action', 'deleted')
                    ->count(),

            'cancelled' =>
                $logs
                    ->where('action', 'cancelled')
                    ->count(),

            'rescheduled' =>
                $logs
                    ->where('action', 'rescheduled')
                    ->count(),

            'refunded' =>
                $logs
                    ->where('action', 'refunded')
                    ->count(),

            'blocked' =>
                $logs
                    ->where('action', 'blocked')
                    ->count(),

            'unblocked' =>
                $logs
                    ->where('action', 'unblocked')
                    ->count(),
        ]);
    }

    public function modules(): JsonResponse
    {
        return response()->json([
            'data' => [
                'booking',
                'cancellation',
                'rescheduling',
                'payment',
                'refund',
                'administration',
                'court_schedule',
                'court_blocking',
                'membership',
                'waitlist',
                'failure_exception',
            ],
        ]);
    }

    public function actions(): JsonResponse
    {
        return response()->json([
            'data' => [
                'created',
                'updated',
                'deleted',
                'cancelled',
                'rescheduled',
                'paid',
                'payment_failed',
                'refunded',
                'refund_failed',
                'blocked',
                'unblocked',
                'promoted',
                'expired',
                'approved',
                'rejected',
            ],
        ]);
    }
}