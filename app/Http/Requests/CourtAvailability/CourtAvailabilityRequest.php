<?php

namespace App\Http\Requests\CourtAvailability;

use Illuminate\Foundation\Http\FormRequest;

class CourtAvailabilityRequest extends FormRequest
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
            'date' => [
                'required',
                'date_format:Y-m-d',
            ],
            'duration_minutes' => [
                'required',
                'integer',
                'min:1',
                'max:1440',
            ],
        ];
    }
}
