<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CancellationPreviewRequest extends FormRequest
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
                'nullable',
                Rule::in([
                    'customer',
                    'admin',
                    'court_closure',
                    'no_show',
                ]),
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'cancellation_type.in' => 'The selected cancellation type is invalid.',
        ];
    }

    /**
     * Get the cancellation type.
     */
    public function cancellationType(): string
    {
        return $this->input('cancellation_type', 'customer');
    }
}