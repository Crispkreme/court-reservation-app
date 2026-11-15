
<?php

namespace App\Repositories;

use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserRepository implements UserRepositoryInterface
{
    protected User $model;

    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function all(): Collection
    {
        return $this->model
            ->select([
                'id',
                'name',
                'email',
                'phone',
                'role',
                'status',
                'email_verified_at',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id', 'desc')
            ->get();
    }

    public function find(int $id): ?User
    {
        return $this->model->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->model
            ->where('email', $email)
            ->first();
    }

    public function create(array $data): User
    {
        return $this->model->create(
            Arr::only($data, [
                'name',
                'email',
                'phone',
                'password',
            ])
        );
    }

    public function update(int $id, array $data): ?User
    {
        $user = $this->find($id);

        if (!$user) {
            return null;
        }

        $user->update(
            Arr::only($data, [
                'name',
                'email',
                'phone',
                'password',
            ])
        );

        return $user->refresh();
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }

    public function getByRole(string $role): Collection
    {
        $this->validateRole($role);

        return $this->model
            ->where('role', $role)
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getByStatus(string $status): Collection
    {
        $this->validateStatus($status);

        return $this->model
            ->where('status', $status)
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getActiveMembers(): Collection
    {
        return $this->model
            ->where('role', User::ROLE_MEMBER)
            ->where('status', User::STATUS_ACTIVE)
            ->orderBy('id', 'desc')
            ->get();
    }

    public function count(): int
    {
        return $this->model->count();
    }

    public function countByRole(string $role): int
    {
        $this->validateRole($role);

        return $this->model
            ->where('role', $role)
            ->count();
    }

    public function updateRole(int $id, string $role): ?User
    {
        $this->validateRole($role);

        return DB::transaction(function () use ($id, $role) {
            $user = $this->model
                ->lockForUpdate()
                ->find($id);

            if (!$user) {
                return null;
            }

            $user->role = $role;
            $user->save();

            return $user->refresh();
        });
    }

    public function updateStatus(int $id, string $status): ?User
    {
        $this->validateStatus($status);

        $user = $this->find($id);

        if (!$user) {
            return null;
        }

        $user->status = $status;
        $user->save();

        return $user->refresh();
    }

    private function validateRole(string $role): void
    {
        if (!in_array($role, [
            User::ROLE_ADMIN,
            User::ROLE_MEMBER,
        ], true)) {
            throw ValidationException::withMessages([
                'role' => 'Invalid user role.',
            ]);
        }
    }

    private function validateStatus(string $status): void
    {
        if (!in_array($status, [
            User::STATUS_ACTIVE,
            User::STATUS_INACTIVE,
        ], true)) {
            throw ValidationException::withMessages([
                'status' => 'Invalid account status.',
            ]);
        }
    }
}