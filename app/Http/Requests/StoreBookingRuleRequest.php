<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRuleRequest extends FormRequest
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
                'required',
                'string',
                'max:255',
            ],

            'rule_type' => [
                'required',
                Rule::in([
                    'general',
                    'event',
                    'tournament',
                ]),
            ],

            'membership_tier_id' => [
                'nullable',
                'integer',
                'exists:membership_tiers,id',
            ],

            'sport_category_id' => [
                'nullable',
                'integer',
                'exists:sport_categories,id',
            ],

            'court_id' => [
                'nullable',
                'integer',
                'exists:courts,id',
            ],

            'event_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
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

            'booking_blocked' => [
                'boolean',
            ],

            'max_bookings_per_day' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'max_minutes_per_day' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'max_future_bookings' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'advance_booking_days' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'allowed_start_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'allowed_end_time' => [
                'nullable',
                'date_format:H:i',
                'after:allowed_start_time',
            ],

            'allowed_days' => [
                'nullable',
                'array',
            ],

            'allowed_days.*' => [
                'integer',
                'between:0,6',
            ],

            'priority' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }
}