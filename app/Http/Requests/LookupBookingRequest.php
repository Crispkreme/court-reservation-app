<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LookupBookingRequest extends FormRequest
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
            'booking_reference' => [
                'required',
                'string',
                'max:100',
            ],

            'customer_email' => [
                'required',
                'email',
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
            'booking_reference.required' =>
                'The booking reference is required.',

            'booking_reference.string' =>
                'The booking reference must be a valid string.',

            'booking_reference.max' =>
                'The booking reference may not be greater than 100 characters.',

            'customer_email.required' =>
                'The customer email address is required.',

            'customer_email.email' =>
                'Please provide a valid customer email address.',

            'customer_email.max' =>
                'The customer email address may not be greater than 255 characters.',
        ];
    }
}