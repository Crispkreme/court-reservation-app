<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourtScheduleOverrideRequest extends FormRequest
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

            'date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'end_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'status' => [
                'required',
                'in:available,blocked,maintenance,closed,holiday',
            ],

            'title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'reason' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'boolean',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $startTime = $this->input('start_time');
            $endTime = $this->input('end_time');

            if (
                !empty($startTime) &&
                !empty($endTime) &&
                $startTime >= $endTime
            ) {
                $validator->errors()->add(
                    'end_time',
                    'End time must be later than start time.'
                );
            }
        });
    }
}