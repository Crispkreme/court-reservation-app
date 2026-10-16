<?php

namespace App\Console\Commands;

use App\Http\Controllers\WaitlistController;
use App\Models\Waitlist;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessWaitlists extends Command
{
    protected $signature = 'waitlists:process';

    protected $description =
        'Expire waitlist claims and promote the next waiting members';

    public function handle(): int
    {
        $expired = Waitlist::query()
            ->where('status', Waitlist::STATUS_NOTIFIED)
            ->whereNotNull('claim_expires_at')
            ->where('claim_expires_at', '<=', now())
            ->get();

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

            app(WaitlistController::class)
                ->promoteNext($waitlist);
        }

        $this->info(
            "Processed {$expired->count()} expired waitlist claims."
        );

        return self::SUCCESS;
    }
}