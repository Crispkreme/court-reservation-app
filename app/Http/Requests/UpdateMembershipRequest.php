<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'membership_type_id' => [
                'sometimes',
                'integer',
                'exists:membership_types,id',
            ],

            'start_date' => [
                'sometimes',
                'date',
            ],

            'expiration_date' => [
                'sometimes',
                'date',
                'after_or_equal:start_date',
            ],

            'status' => [
                'sometimes',
                Rule::in([
                    'pending',
                    'active',
                    'expired',
                    'suspended',
                    'cancelled',
                ]),
            ],

            'base_price' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'discount_type' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'none',
                    'percentage',
                    'fixed',
                ]),
            ],

            'discount_value' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],

            'final_price' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }
}