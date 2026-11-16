<?php

namespace App\Http\Requests\CourtSchedule;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourtScheduleRequest extends FormRequest
{
    
    public function authorize(): bool
    {
        return in_array(
            $this->user()?->role,
            ['admin', 'member'],
            true
        );
    }

    public function rules(): array
    {
        return [
            'date' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
            ],

            'view' => [
                'sometimes',
                'required',
                Rule::in(['daily', 'weekly']),
            ],

            'court_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:courts,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'Please select a date.',
            'date.date_format' => 'Date must be in YYYY-MM-DD format.',

            'view.required' => 'Please select a schedule view.',
            'view.in' => 'Schedule view must be daily or weekly.',

            'court_id.integer' => 'Invalid court ID.',
            'court_id.exists' => 'The selected court does not exist.',
        ];
    }
}
