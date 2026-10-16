<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWaitlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'required',
                'integer',
                'exists:courts,id',
            ],

            'sport_category_id' => [
                'nullable',
                'integer',
                'exists:sport_categories,id',
            ],

            'booking_date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'end_time' => [
                'required',
                'date_format:H:i',
                'after:start_time',
            ],

            'duration_minutes' => [
                'required',
                'integer',
                'min:1',
            ],

            'claim_window_minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:1440',
            ],
        ];
    }
}