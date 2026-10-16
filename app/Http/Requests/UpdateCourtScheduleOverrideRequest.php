<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourtScheduleOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'court_id' => [
                'sometimes',
                'integer',
                'exists:courts,id',
            ],

            'date' => [
                'sometimes',
                'date',
            ],

            'start_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'end_time' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],

            'status' => [
                'sometimes',
                'in:available,blocked,maintenance,closed,holiday',
            ],

            'title' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'reason' => [
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $courtScheduleOverride = $this->route(
                'courtScheduleOverride'
            );

            if (!$courtScheduleOverride) {
                return;
            }

            $startTime = $this->input('start_time')
                ?? $courtScheduleOverride->start_time;

            $endTime = $this->input('end_time')
                ?? $courtScheduleOverride->end_time;

            if (
                $startTime &&
                $endTime &&
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