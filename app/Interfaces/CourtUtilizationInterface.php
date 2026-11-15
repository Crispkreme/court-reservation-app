<?php

namespace App\Interfaces;

interface CourtUtilizationInterface
{
    public function summary(string $startDate, string $endDate, ?int $courtId = null): array;
}
