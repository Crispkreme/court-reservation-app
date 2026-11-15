<?php

namespace App\Interfaces;

use App\Models\SportCategory;
use Illuminate\Database\Eloquent\Collection;

interface SportCategoryRepositoryInterface
{
    public function all(array $filters = []): Collection;
    public function find(int $id): ?SportCategory;
    public function create(array $data): SportCategory;
    public function update(int $id, array $data): ?SportCategory;
    public function delete(int $id): bool;
}
