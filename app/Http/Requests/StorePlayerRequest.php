<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => [
                'nullable',
                'integer',
                'exists:members,id',
                'unique:players,member_id',
            ],

            'first_name' => [
                'required',
                'string',
                'max:100',
            ],

            'last_name' => [
                'required',
                'string',
                'max:100',
            ],

            'email' => [
                'nullable',
                'email',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'player_type' => [
                'required',
                'in:member,guest',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $playerType = $this->input('player_type');
            $memberId = $this->input('member_id');

            if (
                $playerType === 'member'
                && empty($memberId)
            ) {
                $validator->errors()->add(
                    'member_id',
                    'A member is required for member players.'
                );
            }

            if (
                $playerType === 'guest'
                && !empty($memberId)
            ) {
                $validator->errors()->add(
                    'member_id',
                    'Guest players cannot have a member account.'
                );
            }
        });
    }
}