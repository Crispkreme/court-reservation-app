<?php

namespace App\Http\Requests\CourtRecurringSchedule;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourtRecurringScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'court_id' => [
                $required,
                'integer',
                Rule::exists('courts', 'id'),
            ],
            'day_of_week' => [
                $required,
                'integer',
                'between:0,6',
            ],
            'opening_time' => [
                'nullable',
                'date_format:H:i',
                'required_if:status,open',
            ],
            'closing_time' => [
                'nullable',
                'date_format:H:i',
                'required_if:status,open',
                'after:opening_time',
            ],
            'status' => [
                $required,
                Rule::in(['open', 'closed']),
            ],
            'effective_from' => [
                $required,
                'date_format:Y-m-d',
            ],
            'effective_until' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:effective_from',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}
