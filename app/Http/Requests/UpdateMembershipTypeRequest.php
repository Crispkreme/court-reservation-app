<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMembershipTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $membershipType = $this->route('membershipType');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('membership_types', 'code')
                    ->ignore($membershipType?->id),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'discount_type' => [
                'required',
                Rule::in([
                    'none',
                    'percentage',
                    'fixed',
                ]),
            ],

            'discount_value' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'duration_days' => [
                'required',
                'integer',
                'min:1',
            ],

            'benefits' => [
                'nullable',
                'array',
            ],

            'access_rules' => [
                'nullable',
                'array',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (
                $this->input('discount_type') === 'percentage'
                && ($this->input('discount_value') ?? 0) > 100
            ) {
                $validator->errors()->add(
                    'discount_value',
                    'Percentage discount cannot exceed 100%.'
                );
            }
        });
    }
}