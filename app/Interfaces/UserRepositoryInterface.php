<?php

namespace App\Interfaces;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function all(): Collection;
    public function find(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function create(array $data): User;
    public function update(int $id, array $data): ?User;
    public function delete(int $id): bool;
    public function getByRole(string $role): Collection;
    public function getByStatus(string $status): Collection;
    public function getActiveMembers(): Collection;
    public function count(): int;
    public function countByRole(string $role): int;
}
