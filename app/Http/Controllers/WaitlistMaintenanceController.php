<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Waitlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class WaitlistMaintenanceController extends Controller
{
    /**
     * Expire all waitlists whose claim window has passed.
     */
    public function expire(): JsonResponse
    {
        $expired = Waitlist::query()
            ->where('status', Waitlist::STATUS_NOTIFIED)
            ->whereNotNull('claim_expires_at')
            ->where(
                'claim_expires_at',
                '<=',
                now()
            )
            ->get();

        $count = 0;

        foreach ($expired as $waitlist) {
            DB::transaction(function () use ($waitlist) {
                $waitlist->update([
                    'status' => Waitlist::STATUS_EXPIRED,
                    'expired_at' => now(),
                    'expiration_reason' =>
                        'Claim window expired.',
                ]);

                $waitlist->histories()->create([
                    'user_id' => $waitlist->user_id,
                    'action' => 'expired',
                    'from_status' => Waitlist::STATUS_NOTIFIED,
                    'to_status' => Waitlist::STATUS_EXPIRED,
                    'position' => $waitlist->position,
                    'description' =>
                        'Claim window expired before the slot was claimed.',
                ]);
            });

            /*
             * Find the next person.
             */
            $next = Waitlist::query()
                ->where(
                    'session_key',
                    $waitlist->session_key
                )
                ->where(
                    'status',
                    Waitlist::STATUS_WAITING
                )
                ->orderBy('position')
                ->first();

            if ($next) {
                app(WaitlistController::class)
                    ->promoteNext($waitlist);
            }

            $count++;
        }

        return response()->json([
            'message' => 'Waitlist expiration processing completed.',
            'expired_count' => $count,
        ]);
    }
}