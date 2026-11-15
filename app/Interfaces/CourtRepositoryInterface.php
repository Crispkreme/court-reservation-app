<?php

namespace App\Interfaces;

use App\Models\Court;
use Illuminate\Database\Eloquent\Collection;

interface CourtRepositoryInterface
{
    public function all(): Collection;
    public function create(array $data): Court;
    public function update(Court $court, array $data): Court;
    public function delete(Court $court): bool;
}
