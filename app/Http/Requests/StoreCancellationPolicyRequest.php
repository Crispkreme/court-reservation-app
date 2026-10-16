<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCancellationPolicyRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'cancellation_type' => [
                'nullable',
                Rule::in([
                    'customer',
                    'admin',
                    'court_closure',
                    'no_show',
                ]),
            ],

            'minimum_hours_before_booking' => [
                'required',
                'integer',
                'min:0',
            ],

            'maximum_hours_before_booking' => [
                'nullable',
                'integer',
                'min:0',
                'gte:minimum_hours_before_booking',
            ],

            'refund_percentage' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'priority' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }
}