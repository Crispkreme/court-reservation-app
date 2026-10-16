<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOperationalControlRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_admin === true;
    }

    public function rules(): array
    {
        return [
            'control_type' => [
                'required',
                'string',
                Rule::in([
                    'manual_booking',
                    'court_block',
                    'temporary_closure',
                    'maintenance',
                    'tournament_event',
                    'booking_window',
                    'manual_cancellation',
                    'manual_reschedule',
                    'manual_refund',
                    'rule_override',
                ]),
            ],

            'court_id' => [
                'nullable',
                'integer',
                'exists:courts,id',
            ],

            'booking_id' => [
                'nullable',
                'integer',
                'exists:bookings,id',
            ],

            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'active',
                    'completed',
                    'cancelled',
                    'expired',
                ]),
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],

            'minimum_advance_hours' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'maximum_advance_days' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'new_booking_date' => [
                'nullable',
                'date',
            ],

            'new_start_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'new_duration_minutes' => [
                'nullable',
                'integer',
                'min:30',
            ],

            'refund_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'refund_reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'override_rules' => [
                'nullable',
                'array',
            ],

            'allowed_roles' => [
                'nullable',
                'array',
            ],

            'allowed_roles.*' => [
                'string',
                'max:100',
            ],

            'reason' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'metadata' => [
                'nullable',
                'array',
            ],
        ];
    }
}