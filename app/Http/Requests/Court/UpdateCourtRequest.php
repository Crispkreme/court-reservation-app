<?php

namespace App\Http\Requests\Court;

use App\Models\Court;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCourtRequest extends FormRequest
{

    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $court = $this->route('court');
        $currentCategoryId = $court?->sport_category_id;

        return [
            'sport_category_id' => [
                'required',
                'integer',
                Rule::exists('sport_categories', 'id')
                    ->where(function ($query) use ($currentCategoryId) {
                        $query->where('status', 'active');

                        if ($currentCategoryId !== null) {
                            $query->orWhere(
                                'id',
                                $currentCategoryId
                            );
                        }
                    }),
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'location' => [
                'required',
                'string',
                'max:255',
            ],

            'court_type' => [
                'required',
                Rule::in(['indoor', 'outdoor']),
            ],

            'min_players' => [
                'required',
                'integer',
                'min:1',
                'max:1000',
            ],

            'max_players' => [
                'required',
                'integer',
                'min:1',
                'max:1000',
                'gte:min_players',
            ],

            'booking_interval_minutes' => [
                'required',
                'integer',
                Rule::in(Court::BOOKING_INTERVALS),
            ],

            'min_booking_minutes' => [
                'required',
                'integer',
                'min:15',
                'max:1440',
                'lte:max_booking_minutes',
            ],

            'max_booking_minutes' => [
                'required',
                'integer',
                'min:15',
                'max:1440',
                'gte:min_booking_minutes',
            ],

            'price_per_hour' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99',
                'decimal:0,2',
            ],

            'opening_time' => [
                'required',
                'date_format:H:i',
            ],

            'closing_time' => [
                'required',
                'date_format:H:i',
                'after:opening_time',
            ],

            'status' => [
                'required',
                Rule::in(Court::STATUSES),
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (
                    $validator->errors()->has('booking_interval_minutes') ||
                    $validator->errors()->has('min_booking_minutes') ||
                    $validator->errors()->has('max_booking_minutes')
                ) {
                    return;
                }

                $interval = (int) $this->input('booking_interval_minutes');
                $minimum = (int) $this->input('min_booking_minutes');
                $maximum = (int) $this->input('max_booking_minutes');

                if (! in_array(
                    $interval,
                    Court::BOOKING_INTERVALS,
                    true
                )) {
                    return;
                }

                if ($minimum % $interval !== 0) {
                    $validator->errors()->add(
                        'min_booking_minutes',
                        'Minimum booking duration must be a multiple of the selected booking interval.'
                    );
                }

                if ($maximum % $interval !== 0) {
                    $validator->errors()->add(
                        'max_booking_minutes',
                        'Maximum booking duration must be a multiple of the selected booking interval.'
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [            
            'min_players.required' =>'Please enter the minimum number of players.',
            'min_players.min' =>'Minimum players must be at least 1.',
            'max_players.required' =>'Please enter the maximum number of players.',
            'max_players.gte' =>'Maximum players must be greater than or equal to minimum players.',
            'booking_interval_minutes.required' =>'Please select a booking interval.',
            'booking_interval_minutes.in' =>'Booking interval must be 15, 30, or 60 minutes.',
            'min_booking_minutes.required' =>'Please enter the minimum booking duration.',
            'min_booking_minutes.min' =>'Minimum booking duration must be at least 15 minutes.',
            'min_booking_minutes.lte' =>'Minimum booking duration cannot exceed maximum booking duration.',
            'max_booking_minutes.required' =>'Please enter the maximum booking duration.',
            'max_booking_minutes.gte' =>'Maximum booking duration must be greater than or equal to minimum booking duration.',
            'max_booking_minutes.max' =>'Maximum booking duration cannot exceed 1440 minutes (24 hours).',
            'price_per_hour.required' =>'Please enter the hourly price for this court.',
            'price_per_hour.min' =>'Court hourly price cannot be negative.',
            'price_per_hour.decimal' =>'Court hourly price cannot have more than 2 decimal places.',
            'opening_time.required' =>'Please select the opening time.',
            'closing_time.required' =>'Please select the closing time.',
            'closing_time.after' =>'Closing time must be later than opening time.',
            'status.required' =>'Please select a court status.',
            'status.in' =>'Please select a valid court status: Available, Maintenance, Closed, or Temporarily Blocked.',
        ];
    }
}