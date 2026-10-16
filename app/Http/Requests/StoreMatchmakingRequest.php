<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMatchmakingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id' => [
                'required',
                'integer',
                'exists:bookings,id',
            ],

            'sport_category_id' => [
                'required',
                'integer',
                'exists:sport_categories,id',
            ],

            'preferred_date' => [
                'required',
                'date',
                'after_or_equal:today',
            ],

            'preferred_start_time' => [
                'required',
                'date_format:H:i',
            ],

            'preferred_end_time' => [
                'required',
                'date_format:H:i',
                'after:preferred_start_time',
            ],

            'required_players' => [
                'required',
                'integer',
                'min:1',
                'max:100',
            ],

            'skill_level' => [
                'nullable',
                'string',
                Rule::in([
                    'any',
                    'beginner',
                    'intermediate',
                    'advanced',
                ]),
            ],

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'availability' => [
                'nullable',
                'array',
            ],

            'availability.days' => [
                'nullable',
                'array',
            ],

            'availability.days.*' => [
                'string',
                Rule::in([
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                ]),
            ],

            'availability.start_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'availability.end_time' => [
                'nullable',
                'date_format:H:i',
                'after:availability.start_time',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }
}