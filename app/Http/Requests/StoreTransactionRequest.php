<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_admin === true;
    }

    public function rules(): array
    {
        return [
            'transaction_id' => [
                'nullable',
                'string',
                'max:100',
                'unique:transactions,transaction_id',
            ],

            'booking_id' => [
                'nullable',
                'integer',
                'exists:bookings,id',
            ],

            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'nullable',
                'string',
                'max:10',
            ],

            'payment_method' => [
                'nullable',
                'string',
                'max:100',
            ],

            'gateway' => [
                'nullable',
                'string',
                'max:100',
            ],

            'gateway_reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'payment_status' => [
                'required',
                Rule::in([
                    'pending',
                    'paid',
                    'failed',
                    'cancelled',
                    'refunded',
                    'partially_refunded',
                ]),
            ],

            'refund_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'refund_status' => [
                'nullable',
                Rule::in([
                    'none',
                    'pending',
                    'processed',
                    'failed',
                    'cancelled',
                ]),
            ],

            'transaction_date' => [
                'nullable',
                'date',
            ],

            'refunded_at' => [
                'nullable',
                'date',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.exists' =>
                'The selected booking does not exist.',

            'user_id.exists' =>
                'The selected member does not exist.',

            'amount.min' =>
                'The transaction amount cannot be negative.',

            'refund_amount.min' =>
                'The refund amount cannot be negative.',
        ];
    }
}