<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'rule_type' => [
                'sometimes',
                'required',
                Rule::in([
                    'general',
                    'event',
                    'tournament',
                ]),
            ],

            'membership_tier_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:membership_tiers,id',
            ],

            'sport_category_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:sport_categories,id',
            ],

            'court_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:courts,id',
            ],

            'event_name' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'starts_at' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'ends_at' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],

            'booking_blocked' => [
                'sometimes',
                'boolean',
            ],

            'max_bookings_per_day' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],

            'max_minutes_per_day' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],

            'max_future_bookings' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
            ],

            'advance_booking_days' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
            ],

            'allowed_start_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'allowed_end_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
                'after:allowed_start_time',
            ],

            'allowed_days' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'allowed_days.*' => [
                'integer',
                'between:0,6',
            ],

            'priority' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}