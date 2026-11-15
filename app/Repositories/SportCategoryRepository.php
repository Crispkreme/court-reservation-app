<?php

namespace App\Repositories;

use App\Interfaces\SportCategoryRepositoryInterface;
use App\Models\SportCategory;
use Illuminate\Database\Eloquent\Collection;

class SportCategoryRepository implements SportCategoryRepositoryInterface
{
    public function __construct(
        private SportCategory $model
    ) {}

    public function all(array $filters = []): Collection
    {
        $query = $this->model->newQuery();

        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere(
                        'description',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('name')->get();
    }

    public function find(int $id): ?SportCategory
    {
        return $this->model->find($id);
    }

    public function create(array $data): SportCategory
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?SportCategory {
        $category = $this->find($id);

        if (!$category) {
            return null;
        }

        $category->update($data);

        return $category->refresh();
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }
}
