<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexCourtRequest extends FormRequest
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
            'sport_category_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:sport_categories,id',
            ],

            'status' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'branch' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
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