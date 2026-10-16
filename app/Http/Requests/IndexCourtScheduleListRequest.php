<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexCourtScheduleListRequest extends FormRequest
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

            'day_of_week' => [
                'sometimes',
                'nullable',
                'integer',
                'between:0,6',
            ],
        ];
    }
}