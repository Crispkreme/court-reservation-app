<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourtRequest extends FormRequest
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

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'court_number' => [
                'nullable',
                'string',
                'max:50',
            ],

            'branch' => [
                'required',
                'string',
                'max:255',
            ],

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'min_players' => [
                'required',
                'integer',
                'min:1',
            ],

            'max_players' => [
                'required',
                'integer',
                'gte:min_players',
            ],

            'status' => [
                'required',
                Rule::in([
                    'available',
                    'maintenance',
                    'closed',
                    'temporarily_blocked',
                ]),
            ],

            'opening_time' => [
                'required',
                'date_format:H:i',
            ],

            'closing_time' => [
                'required',
                'date_format:H:i',
            ],

            'booking_interval' => [
                'required',
                'integer',
                'min:5',
            ],

            'minimum_booking_duration' => [
                'required',
                'integer',
                'min:5',
            ],

            'maximum_booking_duration' => [
                'required',
                'integer',
                'gte:minimum_booking_duration',
            ],

            'base_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'required',
                'string',
                'size:3',
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