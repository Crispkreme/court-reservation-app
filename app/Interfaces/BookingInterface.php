<?php

namespace App\Interfaces;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface BookingInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Booking;
    public function create(array $data): Booking;
    public function update(int $id, array $data): Booking;
    public function delete(int $id): bool;
    public function updateStatus(int $id, string $status): Booking;
    public function cancel(int $id, int $userId): Booking;
    public function getByCourt(int $courtId, array $filters = []): Collection;
    public function getByUser(int $userId, array $filters = []): Collection;
    public function getForCalendar(string $startDate,string $endDate,?int $courtId = null,?string $status = null,?string $timeFrom = null,?string $timeTo = null): Collection;
    public function hasOverlappingBooking(int $courtId,string $startAt,string $endAt,?int $excludeBookingId = null): bool;
}
