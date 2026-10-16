<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sport_category_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:sport_categories,id',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'court_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'branch' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'location' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'min_players' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],

            'max_players' => [
                'sometimes',
                'required',
                'integer',
                'gte:min_players',
            ],

            'status' => [
                'sometimes',
                'required',
                Rule::in([
                    'available',
                    'maintenance',
                    'closed',
                    'temporarily_blocked',
                ]),
            ],

            'opening_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
            ],

            'closing_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
            ],

            'booking_interval' => [
                'sometimes',
                'required',
                'integer',
                'min:5',
            ],

            'minimum_booking_duration' => [
                'sometimes',
                'required',
                'integer',
                'min:5',
            ],

            'maximum_booking_duration' => [
                'sometimes',
                'required',
                'integer',
                'gte:minimum_booking_duration',
            ],

            'base_price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'sometimes',
                'required',
                'string',
                'size:3',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}