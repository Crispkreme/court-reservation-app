<?php

namespace App\Http\Requests;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexBookingStatusRequest extends FormRequest
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
            'status' => [
                'sometimes',
                'nullable',
                'string',
                Rule::in([
                    'pending',
                    'confirmed',
                    'completed',
                    'cancelled',
                    'rejected',
                ]),
            ],

            'date' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'court_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:courts,id',
            ],

            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }
}