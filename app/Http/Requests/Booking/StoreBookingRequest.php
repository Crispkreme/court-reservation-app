<?php

namespace App\Http\Requests\Booking;

use App\Models\Court;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user?->isActive() === true
            && (
                ($this->routeIs('admin.*') && $user->isAdmin())
                || ($this->routeIs('member.*') && $user->isMember())
            );
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'required',
                'integer',
                Rule::exists('courts', 'id'),
            ],
            'user_id' => [
                $this->routeIs('admin.*') ? 'required' : 'prohibited',
                'integer',
                Rule::exists('users', 'id')
                    ->where('role', User::ROLE_MEMBER)
                    ->where('status', User::STATUS_ACTIVE),
            ],
            'start_at' => [
                'required',
                'date_format:Y-m-d H:i:s',
            ],
            'end_at' => [
                'required',
                'date_format:Y-m-d H:i:s',
                'after:start_at',
            ],
            'duration_minutes' => [
                'required',
                'integer',
                'min:1',
                'max:1440',
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $start = Carbon::createFromFormat(
                    '!Y-m-d H:i:s',
                    $this->input('start_at'),
                    Court::TIME_ZONE
                );

                $end = Carbon::createFromFormat(
                    '!Y-m-d H:i:s',
                    $this->input('end_at'),
                    Court::TIME_ZONE
                );

                $duration = (int) $start->diffInMinutes($end);

                if ($duration !== (int) $this->input('duration_minutes')) {
                    $validator->errors()->add(
                        'duration_minutes',
                        'The duration must match the selected start and end times.'
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.required' => 'Please select a court.',
            'court_id.exists' => 'The selected court does not exist.',
            'user_id.required' => 'Please select a member.',
            'user_id.prohibited' => 'Members cannot assign bookings to other users.',
            'user_id.exists' => 'The selected member is invalid or inactive.',
            'start_at.required' => 'Please select a booking start time.',
            'start_at.date_format' => 'Use YYYY-MM-DD HH:MM:SS for the start time.',
            'end_at.required' => 'Please select a booking end time.',
            'end_at.date_format' => 'Use YYYY-MM-DD HH:MM:SS for the end time.',
            'end_at.after' => 'The end time must be after the start time.',
            'duration_minutes.required' => 'Booking duration is required.',
        ];
    }
}