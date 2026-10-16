<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourtPricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pricing_type' => [
                'sometimes',
                'required',
                Rule::in([
                    'hourly',
                    'per_booking',
                ]),
            ],

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'start_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'end_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'day_of_week' => [
                'sometimes',
                'nullable',
                'integer',
                'between:0,6',
            ],

            'effective_from' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'effective_until' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:effective_from',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}