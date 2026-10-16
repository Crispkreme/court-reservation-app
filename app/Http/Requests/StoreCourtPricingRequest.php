<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourtPricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pricing_type' => [
                'required',
                Rule::in([
                    'hourly',
                    'per_booking',
                ]),
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'start_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'end_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'day_of_week' => [
                'nullable',
                'integer',
                'between:0,6',
            ],

            'effective_from' => [
                'nullable',
                'date',
            ],

            'effective_until' => [
                'nullable',
                'date',
                'after_or_equal:effective_from',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }
}