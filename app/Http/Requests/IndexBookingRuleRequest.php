<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexBookingRuleRequest extends FormRequest
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
            'rule_type' => [
                'nullable',
                'string',
                Rule::in([
                    'booking',
                    'cancellation',
                    'rescheduling',
                    'membership',
                    'access',
                ]),
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ];
    }
}