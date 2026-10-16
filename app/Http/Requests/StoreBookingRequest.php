<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
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
                Rule::in([30, 60, 90]),
            ],

            'players_count' => [
                'required',
                'integer',
                'min:1',
            ],

            'booking_source' => [
                'nullable',
                Rule::in([
                    'ONLINE',
                    'PUBLIC',
                    'ADMIN',
                ]),
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

            // 'membership_type' => [
            //     'nullable',
            //     'string',
            //     'max:100',
            // ],

            'notes' => [
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'sport_category_id.required' =>
                'Sport category is required.',

            'sport_category_id.integer' =>
                'Sport category ID must be a valid number.',

            'sport_category_id.exists' =>
                'The selected sport category does not exist.',

            'court_id.required' =>
                'Court is required.',

            'court_id.integer' =>
                'Court ID must be a valid number.',

            'court_id.exists' =>
                'The selected court does not exist.',

            'booking_date.required' =>
                'Booking date is required.',

            'booking_date.date' =>
                'Please provide a valid booking date.',

            'start_time.required' =>
                'Start time is required.',

            'start_time.date_format' =>
                'Start time must be in HH:mm format.',

            'duration_minutes.required' =>
                'Duration is required.',

            'duration_minutes.integer' =>
                'Duration must be a valid number.',

            'duration_minutes.in' =>
                'Duration must be 30, 60, or 90 minutes.',

            'players_count.required' =>
                'Number of players is required.',

            'players_count.integer' =>
                'Number of players must be a valid number.',

            'players_count.min' =>
                'At least one player is required.',

            'booking_source.in' =>
                'The selected booking source is invalid.',

            'customer_name.max' =>
                'Customer name must not exceed 255 characters.',

            'customer_email.email' =>
                'Please provide a valid customer email address.',

            'customer_email.max' =>
                'Customer email must not exceed 255 characters.',

            'customer_phone.max' =>
                'Customer phone must not exceed 50 characters.',

            'membership_type.max' =>
                'Membership type must not exceed 100 characters.',
        ];
    }
}