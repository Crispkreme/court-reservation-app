<?php

namespace App\Interfaces;

interface CourtAvailabilityInterface
{    
    public function getAvailability(int $courtId,string $date,int $durationMinutes): array;
    public function isSlotAvailable(int $courtId,string $startAt,string $endAt): bool;
}
