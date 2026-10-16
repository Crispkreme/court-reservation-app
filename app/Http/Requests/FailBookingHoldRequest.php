<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FailBookingHoldRequest extends FormRequest
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
            'failure_reason' => [
                'required',
                'string',
                'max:1000',
            ],

            'payment_reference' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'failure_reason.required' =>
                'A failure reason is required.',

            'failure_reason.string' =>
                'The failure reason must be a valid string.',

            'failure_reason.max' =>
                'The failure reason may not be greater than 1000 characters.',

            'payment_reference.string' =>
                'The payment reference must be a valid string.',

            'payment_reference.max' =>
                'The payment reference may not be greater than 255 characters.',
        ];
    }
}