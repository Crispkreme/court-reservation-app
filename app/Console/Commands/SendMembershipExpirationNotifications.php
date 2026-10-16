<?php

namespace App\Console\Commands;

use App\Models\Membership;
use App\Notifications\MembershipExpirationNotification;
use Illuminate\Console\Command;

class SendMembershipExpirationNotifications extends Command
{
    protected $signature = 'memberships:notify-expiring
                            {--days=7 : Number of days before expiration}';

    protected $description =
        'Send membership expiration notifications';

    public function handle(): int
    {
        $days = (int) $this->option('days');

        $memberships = Membership::query()
            ->with([
                'user',
                'membershipType',
            ])
            ->where('status', 'active')
            ->whereBetween('expiration_date', [
                today(),
                today()->addDays($days),
            ])
            ->whereNull('expiration_notified_at')
            ->get();

        foreach ($memberships as $membership) {
            $membership->user->notify(
                new MembershipExpirationNotification(
                    $membership
                )
            );

            $membership->update([
                'expiration_notified_at' => now(),
            ]);
        }

        $this->info(
            "Sent {$memberships->count()} membership expiration notification(s)."
        );

        return self::SUCCESS;
    }
}