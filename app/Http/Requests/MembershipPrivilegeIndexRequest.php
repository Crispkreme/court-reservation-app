<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MembershipPrivilegeIndexRequest extends FormRequest
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
            'membership_type_id' => [
                'nullable',
                'integer',
                'exists:membership_types,id',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ];
    }
}