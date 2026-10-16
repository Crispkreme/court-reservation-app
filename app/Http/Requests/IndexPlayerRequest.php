<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }
}