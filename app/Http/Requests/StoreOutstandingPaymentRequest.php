<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOutstandingPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_id' => [
                'nullable',
                'integer',
                'exists:transactions,id',
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

            'due_date' => [
                'required',
                'date',
            ],

            'original_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'paid_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'lte:original_amount',
            ],

            'outstanding_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'status' => [
                'required',
                Rule::in([
                    'outstanding',
                    'partially_paid',
                    'paid',
                    'written_off',
                ]),
            ],

            'follow_up_status' => [
                'required',
                Rule::in([
                    'pending',
                    'contacted',
                    'promised',
                    'escalated',
                    'resolved',
                ]),
            ],

            'last_follow_up_at' => [
                'nullable',
                'date',
            ],

            'next_follow_up_at' => [
                'nullable',
                'date',
            ],

            'follow_up_notes' => [
                'nullable',
                'string',
            ],

            'resolved_at' => [
                'nullable',
                'date',
            ],
        ];
    }
}