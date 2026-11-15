<?php

namespace App\Http\Requests\CourtMaintenancePeriod;

use App\Models\CourtMaintenancePeriod;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCourtMaintenancePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'court_id' => ['required', 'integer', 'exists:courts,id'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'reason' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $start = Carbon::parse(
                    $this->input('start_at'),
                    'Asia/Dubai'
                )->utc();

                $end = Carbon::parse(
                    $this->input('end_at'),
                    'Asia/Dubai'
                )->utc();

                $overlap = CourtMaintenancePeriod::query()
                    ->where('court_id', $this->integer('court_id'))
                    ->where('start_at', '<', $end)
                    ->where('end_at', '>', $start)
                    ->exists();

                if ($overlap) {
                    $validator->errors()->add(
                        'start_at',
                        'This maintenance period overlaps an existing period.'
                    );
                }
            },
        ];
    }
}
