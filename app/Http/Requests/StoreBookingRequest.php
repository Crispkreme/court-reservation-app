<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'sport_category_id' => [
                'required',
                'integer',
                'exists:sport_categories,id',
            ],

            'court_id' => [
                'required',
                'integer',
                'exists:courts,id',
            ],

            'booking_reference' => [
                'nullable',
                'string',
                'max:100',
            ],

            'booking_date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i:s',
            ],

            'end_time' => [
                'required',
                'date_format:H:i:s',
                'after:start_time',
            ],

            'duration_minutes' => [
                'required',
                'integer',
                Rule::in([30, 60, 90]),
            ],

            'players_count' => [
                'required',
                'integer',
                'min:1',
            ],

            'unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'total_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'booking_source' => [
                'required',
                Rule::in([
                    'ONLINE',
                    'PUBLIC',
                    'ADMIN',
                    'MOBILE',
                ]),
            ],

            'status' => [
                'required',
                Rule::in([
                    'pending',
                    'confirmed',
                    'cancelled',
                    'completed',
                    'PENDING',
                    'CONFIRMED',
                    'CANCELLED',
                    'COMPLETED',
                ]),
            ],

            'customer_name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'customer_phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.exists' => 'The selected member does not exist.',
            'sport_category_id.required' => 'Sport category is required.',
            'sport_category_id.exists' => 'The selected sport category does not exist.',
            'court_id.required' => 'Court is required.',
            'court_id.exists' => 'The selected court does not exist.',
            'booking_date.required' => 'Booking date is required.',
            'booking_date.date' => 'Please provide a valid booking date.',
            'start_time.required' => 'Start time is required.',
            'start_time.date_format' => 'Start time must be in HH:mm:ss format.',
            'end_time.required' => 'End time is required.',
            'end_time.date_format' => 'End time must be in HH:mm:ss format.',
            'end_time.after' => 'End time must be later than start time.',
            'duration_minutes.required' => 'Duration is required.',
            'duration_minutes.in' => 'Duration must be 30, 60, or 90 minutes.',
            'players_count.required' => 'Number of players is required.',
            'players_count.min' => 'At least one player is required.',
            'customer_name.required' => 'Customer name is required.',
            'customer_email.email' => 'Please provide a valid customer email address.',
            'booking_source.in' => 'The selected booking source is invalid.',
            'status.in' => 'The selected booking status is invalid.',
        ];
    }
}