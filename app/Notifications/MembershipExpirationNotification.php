<?php

namespace App\Notifications;

use App\Models\Membership;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipExpirationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Membership $membership
    ) {
    }

    public function via(object $notifiable): array
    {
        return [
            'database',
            'mail',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $days = $this->membership->days_remaining;

        return (new MailMessage)
            ->subject('Membership Expiration Reminder')
            ->greeting("Hello {$notifiable->name},")
            ->line(
                "Your {$this->membership->membershipType->name} membership is expiring in {$days} day(s)."
            )
            ->line(
                "Expiration date: {$this->membership->expiration_date->format('F d, Y')}"
            )
            ->line(
                'Please renew your membership to continue receiving member benefits.'
            );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'membership_expiration',
            'membership_id' => $this->membership->id,
            'membership_type' => $this->membership
                ->membershipType
                ->name,
            'expiration_date' => $this->membership
                ->expiration_date
                ->toDateString(),
            'days_remaining' => $this->membership
                ->days_remaining,
        ];
    }
}