<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvailabilityRequest extends FormRequest
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
                'required',
                'integer',
                'exists:sport_categories,id',
            ],

            'date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'duration_minutes' => [
                'required',
                'integer',
                'in:30,60,90',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'sport_category_id.required' =>
                'Sport category is required.',

            'sport_category_id.integer' =>
                'Sport category ID must be a valid number.',

            'sport_category_id.exists' =>
                'The selected sport category does not exist.',

            'date.required' =>
                'Date is required.',

            'date.date' =>
                'Please provide a valid date.',

            'start_time.required' =>
                'Start time is required.',

            'start_time.date_format' =>
                'Start time must be in HH:mm format.',

            'duration_minutes.required' =>
                'Duration is required.',

            'duration_minutes.integer' =>
                'Duration must be a valid number.',

            'duration_minutes.in' =>
                'Duration must be 30, 60, or 90 minutes.',
        ];
    }
}