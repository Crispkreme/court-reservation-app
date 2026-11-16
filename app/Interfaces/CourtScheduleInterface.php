<?php

namespace App\Interfaces;

interface CourtScheduleInterface
{
    public function getSchedule(
        string $date,
        string $view = 'daily',
        ?int $courtId = null,
        bool $isAdmin = false
    ): array;
}
