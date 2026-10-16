<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'PENDING',
                    'CONFIRMED',
                    'CANCELLED',
                    'COMPLETED',
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

            'sport_category_id' => [
                'nullable',
                'integer',
                'exists:sport_categories,id',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'status.in' =>
                'The selected booking status is invalid.',

            'date.date' =>
                'The booking date must be a valid date.',

            'court_id.integer' =>
                'The court ID must be a valid number.',

            'court_id.exists' =>
                'The selected court does not exist.',

            'sport_category_id.integer' =>
                'The sport category ID must be a valid number.',

            'sport_category_id.exists' =>
                'The selected sport category does not exist.',
        ];
    }
}