<?php

namespace App\Http\Requests\CourtMaintenancePeriod;

use App\Models\CourtMaintenancePeriod;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateCourtMaintenancePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'court_id' => ['sometimes', 'required', 'integer', 'exists:courts,id'],
            'start_at' => ['sometimes', 'required', 'date'],
            'end_at' => ['sometimes', 'required', 'date'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $period = $this->route('maintenancePeriod');

                if (! $period instanceof CourtMaintenancePeriod) {
                    return;
                }

                $courtId = $this->input('court_id', $period->court_id);

                $start = $this->has('start_at')
                    ? Carbon::parse($this->input('start_at'), 'Asia/Dubai')->utc()
                    : $period->start_at;

                $end = $this->has('end_at')
                    ? Carbon::parse($this->input('end_at'), 'Asia/Dubai')->utc()
                    : $period->end_at;

                if ($end->lessThanOrEqualTo($start)) {
                    $validator->errors()->add(
                        'end_at',
                        'The end date must be after the start date.'
                    );

                    return;
                }

                $overlap = CourtMaintenancePeriod::query()
                    ->where('court_id', $courtId)
                    ->whereKeyNot($period->id)
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
