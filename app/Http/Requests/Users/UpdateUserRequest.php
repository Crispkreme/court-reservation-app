<?php

namespace App\Http\Requests\Users;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
  
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->isAdmin()
            && $user->isActive();
    }

    public function rules(): array
    {
        $routeUser = $this->route('user');
        $userId = $routeUser instanceof User
            ? $routeUser->getKey()
            : $routeUser;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($userId),
            ],

            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
            ],

            'password' => [
                'sometimes',
                'nullable',
                'string',
                Password::min(8),
                'confirmed',
            ],

            'role' => [
                'prohibited',
            ],

            'status' => [
                'prohibited',
            ],

            'department' => [
                'prohibited',
            ],

            'position' => [
                'prohibited',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Full name is required.',
            'name.string' => 'Full name must be valid text.',
            'name.max' => 'Full name cannot exceed 255 characters.',

            // Email
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',

            // Phone
            'phone.string' => 'Phone number must be valid text.',
            'phone.max' => 'Phone number cannot exceed 20 characters.',

            // Password
            'password.min' => 'Password must contain at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',

            // Restricted fields
            'role.prohibited' => 'User roles must be changed through the role management endpoint.',
            'status.prohibited' => 'Account status must be changed through the status management endpoint.',
            'department.prohibited' => 'Department is not a valid CourtBook user field.',
            'position.prohibited' => 'Position is not a valid CourtBook user field.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
            'phone' => 'phone number',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
        ];
    }
}
