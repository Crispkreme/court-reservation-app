<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingHoldRequest extends FormRequest
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

            'booking_date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'duration_minutes' => [
                'required',
                'integer',
                'in:30,60,90',
            ],

            'players_count' => [
                'required',
                'integer',
                'min:1',
            ],

            'hold_duration_minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:30',
            ],

            'customer_name' => [
                'nullable',
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

            'metadata' => [
                'nullable',
                'array',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'sport_category_id.required' =>
                'Please select a sport category.',

            'sport_category_id.exists' =>
                'The selected sport category does not exist.',

            'court_id.required' =>
                'Please select a court.',

            'court_id.exists' =>
                'The selected court does not exist.',

            'booking_date.required' =>
                'Please select a booking date.',

            'booking_date.date' =>
                'The booking date must be a valid date.',

            'start_time.required' =>
                'Please select a start time.',

            'start_time.date_format' =>
                'The start time must be in HH:MM format.',

            'duration_minutes.required' =>
                'Please select a booking duration.',

            'duration_minutes.in' =>
                'The booking duration must be 30, 60, or 90 minutes.',

            'players_count.required' =>
                'Please specify the number of players.',

            'players_count.min' =>
                'At least one player is required.',

            'hold_duration_minutes.max' =>
                'The hold duration cannot exceed 30 minutes.',

            'customer_email.email' =>
                'Please provide a valid customer email address.',
        ];
    }
}