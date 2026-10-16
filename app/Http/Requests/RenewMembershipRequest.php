<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RenewMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'membership_type_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:membership_types,id',
            ],

            'status' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'pending',
                    'active',
                ]),
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }
}