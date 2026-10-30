<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSportCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sportCategory = $this->route('sport_category');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('sport_categories', 'name')
                    ->ignore($sportCategory?->id),
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('sport_categories', 'slug')
                    ->ignore($sportCategory?->id),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }
}