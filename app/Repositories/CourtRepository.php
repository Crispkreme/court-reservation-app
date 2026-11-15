<?php

namespace App\Repositories;

use App\Interfaces\CourtRepositoryInterface;
use App\Models\Court;
use Illuminate\Database\Eloquent\Collection;

class CourtRepository implements CourtRepositoryInterface
{
    public function all(): Collection
    {
        return Court::query()
            ->with('sportCategory')
            ->latest()
            ->get();
    }

    public function create(array $data): Court
    {
        $court = Court::create($data);
        return $court->refresh()->load('sportCategory');
    }

    public function update(Court $court, array $data): Court
    {
        $court->update($data);
        return $court->refresh()->load('sportCategory');
    }

    public function delete(Court $court): bool
    {
        return (bool) $court->delete();
    }
}
