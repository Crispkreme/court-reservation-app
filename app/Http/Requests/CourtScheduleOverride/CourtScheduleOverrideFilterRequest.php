<?php

namespace App\Http\Requests\CourtScheduleOverride;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourtScheduleOverrideFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'nullable',
                'integer',
                Rule::exists('courts', 'id'),
            ],

            'date_from' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'date_to' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:date_from',
            ],

            'status' => [
                'nullable',
                Rule::in(['open', 'closed']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.exists' => 'The selected court does not exist.',
            'date_from.date_format' => 'Start date must be in YYYY-MM-DD format.',
            'date_to.date_format' => 'End date must be in YYYY-MM-DD format.',
            'date_to.after_or_equal' => 'End date cannot be earlier than start date.',
            'status.in' => 'Status must be open or closed.',
        ];
    }
}
