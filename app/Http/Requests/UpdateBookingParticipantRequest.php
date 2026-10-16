<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'participant_status' => [
                'required',
                'in:invited,confirmed,declined,cancelled,attended,no_show',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ];
    }
}