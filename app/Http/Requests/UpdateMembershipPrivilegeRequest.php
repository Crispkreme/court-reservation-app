<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMembershipPrivilegeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $membershipPrivilege = $this->route('membershipPrivilege');

        return [
            'membership_type_id' => [
                'required',
                'integer',
                'exists:membership_types,id',
                Rule::unique(
                    'membership_privileges',
                    'membership_type_id'
                )->ignore($membershipPrivilege->id),
            ],

            'priority_booking' => [
                'boolean',
            ],

            'booking_advance_days' => [
                'required',
                'integer',
                'min:0',
                'max:365',
            ],

            'premium_courts' => [
                'boolean',
            ],

            'daily_booking_limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],

            'max_duration_minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:1440',
            ],

            'max_players' => [
                'nullable',
                'integer',
                'min:1',
                'max:1000',
            ],

            'cancellation_window_hours' => [
                'nullable',
                'integer',
                'min:0',
                'max:720',
            ],

            'free_cancellation' => [
                'boolean',
            ],

            'reschedule_window_hours' => [
                'nullable',
                'integer',
                'min:0',
                'max:720',
            ],

            'free_rescheduling' => [
                'boolean',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }
}