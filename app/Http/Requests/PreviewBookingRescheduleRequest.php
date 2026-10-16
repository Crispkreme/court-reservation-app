<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PreviewBookingRescheduleRequest extends FormRequest
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
            'booking_date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'end_time' => [
                'required',
                'date_format:H:i',
            ],

            'court_id' => [
                'required',
                'integer',
                'exists:courts,id',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'booking_date.required' =>
                'The booking date is required.',

            'booking_date.date' =>
                'The booking date must be a valid date.',

            'start_time.required' =>
                'The start time is required.',

            'start_time.date_format' =>
                'The start time must be in HH:MM format.',

            'end_time.required' =>
                'The end time is required.',

            'end_time.date_format' =>
                'The end time must be in HH:MM format.',

            'court_id.required' =>
                'The court is required.',

            'court_id.integer' =>
                'The court ID must be a valid integer.',

            'court_id.exists' =>
                'The selected court does not exist.',
        ];
    }
}