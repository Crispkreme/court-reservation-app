<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingHoldIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'ACTIVE',
                    'RELEASED',
                    'EXPIRED',
                    'CONVERTED',
                ]),
            ],

            'date' => [
                'nullable',
                'date',
            ],

            'court_id' => [
                'nullable',
                'integer',
                'exists:courts,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.string' => 'Hold status must be a valid string.',
            'status.in' => 'The selected hold status is invalid.',
            'date.date' => 'The hold date must be a valid date.',
            'court_id.integer' => 'Court ID must be a valid number.',
            'court_id.exists' => 'The selected court does not exist.',
        ];
    }
}