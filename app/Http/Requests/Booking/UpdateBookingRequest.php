<?php

namespace App\Http\Requests\Booking;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->routeIs('admin.*')
            && $this->user()?->canAccessAdminCalendar() === true;
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('courts', 'id'),
            ],
            'user_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('users', 'id')
                    ->where('role', User::ROLE_MEMBER)
                    ->where('status', User::STATUS_ACTIVE),
            ],
            'start_at' => [
                'sometimes',
                'required',
                'date_format:Y-m-d H:i:s',
            ],
            'end_at' => [
                'sometimes',
                'required',
                'date_format:Y-m-d H:i:s',
            ],
            'duration_minutes' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                'max:1440',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.exists' => 'The selected court does not exist.',
            'user_id.exists' => 'The selected member is invalid or inactive.',
            'start_at.date_format' => 'Use YYYY-MM-DD HH:MM:SS for the start time.',
            'end_at.date_format' => 'Use YYYY-MM-DD HH:MM:SS for the end time.',
            'duration_minutes.min' => 'Booking duration must be greater than zero.',
        ];
    }
}