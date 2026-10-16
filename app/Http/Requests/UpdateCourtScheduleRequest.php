<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourtScheduleRequest extends FormRequest
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

            'day_of_week' => [
                'sometimes',
                'integer',
                'between:0,6',
            ],

            'start_time' => [
                'sometimes',
                'date_format:H:i',
            ],

            'end_time' => [
                'sometimes',
                'date_format:H:i',
            ],

            'status' => [
                'sometimes',
                'in:available,blocked,maintenance,closed',
            ],

            'start_date' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'end_date' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $startTime = $this->input('start_time')
            ?? $this->route('courtSchedule')?->start_time;

        $endTime = $this->input('end_time')
            ?? $this->route('courtSchedule')?->end_time;

        if ($startTime && $endTime) {
            $this->merge([
                'end_time' => $endTime,
            ]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $startTime = $this->input('start_time')
                ?? $this->route('courtSchedule')?->start_time;

            $endTime = $this->input('end_time')
                ?? $this->route('courtSchedule')?->end_time;

            if ($startTime && $endTime && $startTime >= $endTime) {
                $validator->errors()->add(
                    'end_time',
                    'End time must be later than start time.'
                );
            }
        });
    }
}
