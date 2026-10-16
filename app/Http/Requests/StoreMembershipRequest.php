<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => [
                'required',
                'integer',
                'exists:members,id',
            ],

            'membership_type_id' => [
                'required',
                'integer',
                'exists:membership_types,id',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'status' => [
                'required',
                Rule::in([
                    'pending',
                    'active',
                    'expired',
                    'suspended',
                    'cancelled',
                ]),
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

            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }
}