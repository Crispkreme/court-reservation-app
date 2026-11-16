<?php

namespace App\Http\Requests\CourtScheduleOverride;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourtScheduleOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'required',
                'integer',
                Rule::exists('courts', 'id'),
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'status' => [
                'required',
                Rule::in(['open', 'closed']),
            ],

            'opening_time' => [
                'nullable',
                'required_if:status,open',
                'date_format:H:i',
            ],

            'closing_time' => [
                'nullable',
                'required_if:status,open',
                'date_format:H:i',
                'after:opening_time',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.required' => 'Please select a court.',
            'court_id.exists' => 'The selected court does not exist.',

            'date.required' => 'Please select an override date.',
            'date.date_format' => 'The date must be in YYYY-MM-DD format.',

            'status.required' => 'Please select a schedule status.',
            'status.in' => 'The schedule status must be open or closed.',

            'opening_time.required_if' => 'Opening time is required when the court is open.',
            'opening_time.date_format' => 'Opening time must be in HH:MM format.',

            'closing_time.required_if' => 'Closing time is required when the court is open.',
            'closing_time.date_format' => 'Closing time must be in HH:MM format.',
            'closing_time.after' => 'Closing time must be later than opening time.',

            'notes.max' => 'Notes cannot exceed 2000 characters.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('status') === 'closed') {
            $this->merge([
                'opening_time' => null,
                'closing_time' => null,
            ]);
        }
    }
}
