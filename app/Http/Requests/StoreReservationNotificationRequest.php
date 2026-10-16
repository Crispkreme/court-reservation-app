<?php

namespace App\Http\Requests;

use App\Models\ReservationNotification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'type' => [
                'required',
                'string',
                Rule::in(ReservationNotification::TYPES),
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'message' => [
                'required',
                'string',
            ],

            'channel' => [
                'required',
                Rule::in(ReservationNotification::CHANNELS),
            ],

            'status' => [
                'nullable',
                Rule::in(ReservationNotification::STATUSES),
            ],

            'priority' => [
                'nullable',
                Rule::in(ReservationNotification::PRIORITIES),
            ],

            'notifiable_type' => [
                'nullable',
                'string',
                'max:255',
            ],

            'notifiable_id' => [
                'nullable',
                'integer',
            ],

            'data' => [
                'nullable',
                'array',
            ],

            'scheduled_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}