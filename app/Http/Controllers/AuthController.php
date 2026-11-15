<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\UserRequest;
use App\Http\Requests\RegisterRequest;

class AuthController extends Controller
{

    private function formatUser(User $user): array
    {
        return $user->only([
            'id',
            'name',
            'email',
            'phone',
            'role',
            'status',
            'email_verified_at',
            'created_at',
            'updated_at',
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please log in.',
            'user' => $this->formatUser($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isActive() || (!$user->isAdmin() && !$user->isMember())) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.'
                ],
            ]);
        }

        $token = $user
            ->createToken('courtbook-auth')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 200);
    }

    public function logout(LogoutRequest $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }

    public function user(UserRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'User information retrieved successfully.',
            'user' => $this->formatUser($request->user()),
        ], 200);
    }
}
