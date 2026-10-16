<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexCourtScheduleOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:courts,id',
            ],

            'date' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'from' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'to' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:from',
            ],
        ];
    }
}