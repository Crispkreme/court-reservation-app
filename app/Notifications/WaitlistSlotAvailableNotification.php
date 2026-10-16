<?php

namespace App\Notifications;

use App\Models\Waitlist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WaitlistSlotAvailableNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Waitlist $waitlist
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
        return (new MailMessage)
            ->subject('Court Slot Available')
            ->greeting('Good news!')
            ->line(
                'A court slot you were waiting for is now available.'
            )
            ->line(
                $this->waitlist->court->name .
                ' on ' .
                $this->waitlist->booking_date->format('F d, Y') .
                ' from ' .
                $this->waitlist->start_time .
                ' to ' .
                $this->waitlist->end_time
            )
            ->line(
                'You have ' .
                $this->waitlist->claim_window_minutes .
                ' minutes to claim the slot.'
            )
            ->action(
                'Claim Slot',
                url('/waitlist/' . $this->waitlist->id)
            )
            ->line(
                'If you do not claim the slot before the deadline, it will be offered to the next person.'
            );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'waitlist_slot_available',
            'waitlist_id' => $this->waitlist->id,
            'court_id' => $this->waitlist->court_id,
            'court_name' => $this->waitlist->court->name,
            'booking_date' => $this->waitlist->booking_date->format('Y-m-d'),
            'start_time' => $this->waitlist->start_time,
            'end_time' => $this->waitlist->end_time,
            'claim_expires_at' => $this->waitlist->claim_expires_at?->toISOString(),
            'message' => 'A court slot is now available for you to claim.',
        ];
    }
}