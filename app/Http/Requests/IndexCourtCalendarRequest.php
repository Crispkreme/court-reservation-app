<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexCourtCalendarRequest extends FormRequest
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
            'start' => [
                'required',
                'date',
            ],

            'end' => [
                'required',
                'date',
                'after_or_equal:start',
            ],

            'court_id' => [
                'nullable',
                'integer',
                'exists:courts,id',
            ],
        ];
    }
}