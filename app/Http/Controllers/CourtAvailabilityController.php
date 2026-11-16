<?php

namespace App\Http\Controllers;

use App\Http\Requests\Booking\CourtAvailabilityRequest;
use App\Interfaces\CourtAvailabilityInterface;
use Illuminate\Http\JsonResponse;

class CourtAvailabilityController extends Controller
{
    public function __construct(
        private readonly CourtAvailabilityInterface $courtAvailabilityRepository
    ) {}

    public function index(
        CourtAvailabilityRequest $request,
        int $court
    ): JsonResponse {
        $data = $request->validated();

        $availability = $this->courtAvailabilityRepository->getAvailability(
            $court,
            $data['date'],
            (int) $data['duration_minutes']
        );

        return response()->json([
            'data' => $availability,
        ]);
    }
}
