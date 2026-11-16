<?php

namespace App\Http\Requests\Booking;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingCalendarRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user?->isActive() === true && $user->isAdmin();
    }

    public function rules(): array
    {
        return [
            'date_from' => [
                'required',
                'date_format:Y-m-d',
            ],

            'date_to' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:date_from',
            ],

            'court_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('courts', 'id'),
            ],

            'status' => [
                'sometimes',
                'nullable',
                Rule::in(Booking::STATUSES),
            ],

            'time_from' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'time_to' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
                'after:time_from',
            ],
        ];
    }

    public function messages(): array
    {
        return [            
            'date_from.required' => 'Please select a start date.',
            'date_to.required' => 'Please select an end date.',
            'date_to.after_or_equal' => 'The end date must be on or after the start date.',
            'court_id.exists' => 'The selected court does not exist.',
            'status.in' => 'The selected booking status is invalid.',
            'time_from.date_format' => 'The start time must be in HH:mm format.',
            'time_to.date_format' => 'The end time must be in HH:mm format.',
            'time_to.after' => 'The end time must be later than the start time.',
        ];
    }
}
