<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCancellationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $booking = $this->route('booking');
        $user = $this->user();

        if (! $user || ! $booking) {
            return false;
        }

        return $booking->user_id === $user->id
            || $user->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'cancellation_type' => [
                'required',
                Rule::in([
                    'customer',
                    'admin',
                    'court_closure',
                    'no_show',
                ]),
            ],

            'cancellation_reason' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'cancellation_type.required' =>
                'Cancellation type is required.',

            'cancellation_type.in' =>
                'The selected cancellation type is invalid.',

            'cancellation_reason.string' =>
                'Cancellation reason must be a string.',

            'cancellation_reason.max' =>
                'Cancellation reason must not exceed 2000 characters.',
        ];
    }
}