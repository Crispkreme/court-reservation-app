<?php

namespace App\Http\Requests\Booking;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingFilterRequest extends FormRequest
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
                'sometimes',
                'integer',
                Rule::exists('courts', 'id'),
            ],
            'user_id' => [
                $this->routeIs('admin.*') ? 'sometimes' : 'prohibited',
                'integer',
                Rule::exists('users', 'id'),
            ],
            'status' => [
                'sometimes',
                Rule::in(Booking::STATUSES),
            ],
            'date_from' => [
                'sometimes',
                'date_format:Y-m-d',
            ],
            'date_to' => [
                'sometimes',
                'date_format:Y-m-d',
                'after_or_equal:date_from',
            ],
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
            'page' => [
                'sometimes',
                'integer',
                'min:1',
            ],
        ];
    }
}
