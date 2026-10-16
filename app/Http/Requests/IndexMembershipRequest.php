<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'membership_type_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:membership_types,id',
            ],

            'member_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:members,id',
            ],

            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'per_page' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }
}