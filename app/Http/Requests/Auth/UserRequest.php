<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{

    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->isActive()
            && ($user->isAdmin() || $user->isMember());
    }

    public function rules(): array
    {
        return [];
    }
}
