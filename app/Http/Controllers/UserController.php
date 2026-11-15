<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(
        protected UserRepositoryInterface $users
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $users = $this->users->all();

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ]);
    }

    public function show(
        Request $request,
        int $user
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $foundUser = $this->users->find($user);

        if (!$foundUser) {
            return $this->notFound();
        }

        return response()->json([
            'success' => true,
            'message' => 'User retrieved successfully.',
            'data' => $this->formatUser($foundUser),
        ]);
    }

    public function store(
        StoreUserRequest $request
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validated();

        unset(
            $validated['password_confirmation'],
            $validated['role'],
            $validated['status']
        );

        $user = $this->users->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Member created successfully.',
            'data' => $this->formatUser($user),
        ], 201);
    }

    public function update(
        UpdateUserRequest $request,
        int $user
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $existingUser = $this->users->find($user);

        if (!$existingUser) {
            return $this->notFound();
        }

        $validated = $request->validated();

        // Do not change passwords when empty.
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        unset(
            $validated['password_confirmation'],
            $validated['role'],
            $validated['status']
        );

        $updatedUser = $this->users->update(
            $user,
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $this->formatUser($updatedUser),
        ]);
    }

    public function updateRole(
        Request $request,
        int $user
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'role' => [
                'required',
                Rule::in([
                    User::ROLE_ADMIN,
                    User::ROLE_MEMBER,
                ]),
            ],
        ]);

        $existingUser = $this->users->find($user);

        if (!$existingUser) {
            return $this->notFound();
        }

        if (
            $request->user()->id === $existingUser->id &&
            $validated['role'] !== User::ROLE_ADMIN
        ) {
            return $this->error(
                'You cannot remove your own administrator role.',
                403
            );
        }

        if (
            $existingUser->isAdmin() &&
            $validated['role'] === User::ROLE_MEMBER &&
            $this->isLastActiveAdmin($existingUser)
        ) {
            return $this->error(
                'You cannot demote the last active administrator.',
                422
            );
        }

        $updatedUser = $this->users->updateRole(
            $user,
            $validated['role']
        );

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully.',
            'data' => $this->formatUser($updatedUser),
        ]);
    }

    public function updateStatus(
        Request $request,
        int $user
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    User::STATUS_ACTIVE,
                    User::STATUS_INACTIVE,
                ]),
            ],
        ]);

        $existingUser = $this->users->find($user);

        if (!$existingUser) {
            return $this->notFound();
        }

        if (
            $request->user()->id === $existingUser->id &&
            $validated['status'] === User::STATUS_INACTIVE
        ) {
            return $this->error(
                'You cannot deactivate your own account.',
                403
            );
        }

        if (
            $existingUser->isAdmin() &&
            $validated['status'] === User::STATUS_INACTIVE &&
            $this->isLastActiveAdmin($existingUser)
        ) {
            return $this->error(
                'You cannot deactivate the last active administrator.',
                422
            );
        }

        $updatedUser = $this->users->updateStatus(
            $user,
            $validated['status']
        );

        // Revoke API tokens for deactivated accounts.
        if ($updatedUser->isInactive()) {
            $updatedUser->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully.',
            'data' => $this->formatUser($updatedUser),
        ]);
    }

    public function destroy(
        Request $request,
        int $user
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $existingUser = $this->users->find($user);

        if (!$existingUser) {
            return $this->notFound();
        }

        if ($request->user()->id === $existingUser->id) {
            return $this->error(
                'You cannot delete your own account.',
                403
            );
        }

        if (
            $existingUser->isAdmin() &&
            $this->isLastActiveAdmin($existingUser)
        ) {
            return $this->error(
                'You cannot delete the last active administrator.',
                422
            );
        }

        $deleted = $this->users->delete($user);

        if (!$deleted) {
            return $this->error(
                'Unable to delete user.',
                500
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

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

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdmin() &&
            $request->user()?->isActive(),
            403,
            'Unauthorized access.'
        );
    }

    private function isLastActiveAdmin(User $user): bool
    {
        if (!$user->isAdmin() || !$user->isActive()) {
            return false;
        }

        return User::admins()
            ->active()
            ->count() <= 1;
    }

    private function notFound(): JsonResponse
    {
        return $this->error('User not found.', 404);
    }

    private function error(
        string $message,
        int $status
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}
