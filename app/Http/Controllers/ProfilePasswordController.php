<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\ChangePasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfilePasswordController extends Controller
{
    /**
     * Update the authenticated user's password.
     *
     * PATCH /api/profile/password
     */
    public function update(
        ChangePasswordRequest $request
    ): JsonResponse {

        $user = $request->user();

        $validated = $request->validated();

        // Verify current password
        if (!Hash::check(
            $validated['current_password'],
            $user->password
        )) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        // Save securely hashed password
        $user->forceFill([
            'password' => Hash::make(
                $validated['password']
            ),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Your password has been updated successfully.',
        ], 200);
    }
}
