<?php

namespace App\Http\Controllers;

use App\Http\Requests\Court\StoreCourtRequest;
use App\Http\Requests\Court\UpdateCourtRequest;
use App\Interfaces\CourtRepositoryInterface;
use App\Models\Court;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CourtController extends Controller
{
    public function __construct(
        private CourtRepositoryInterface $courts
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $courts = $this->courts->all();
        } else {
            $courts = Court::query()
                ->with('sportCategory')
                ->whereHas('sportCategory', function ($query) {
                    $query->where('status', 'active');
                })
                ->orderBy('name')
                ->get();
        }

        $now = Carbon::now(Court::TIME_ZONE);

        $courts->each(function (Court $court) use ($now) {
            $this->appendCourtDetails($court, $now);
        });

        return response()->json([
            'data' => $courts,
        ]);
    }

    public function show(Request $request, Court $court): JsonResponse {
        if ($request->user()->role !== 'admin') {
            abort_unless(
                $court->sportCategory()
                    ->where('status', 'active')
                    ->exists(),
                404
            );
        }

        $court->load('sportCategory');
        $this->appendCourtDetails($court, Carbon::now(Court::TIME_ZONE));

        return response()->json([
            'data' => $court,
        ]);
    }

    public function store(StoreCourtRequest $request): JsonResponse {
        abort_unless($request->user()->role === 'admin', 403);

        $court = $this->courts->create($request->validated());
        $court->load('sportCategory');

        $this->appendCourtDetails($court, Carbon::now(Court::TIME_ZONE));

        return response()->json([
            'message' => 'Court created successfully.',
            'data' => $court,
        ], 201);
    }

    public function update(UpdateCourtRequest $request,Court $court): JsonResponse {
        abort_unless($request->user()->role === 'admin',403);

        $court = $this->courts->update($court,$request->validated());
        $court->load('sportCategory');

        $this->appendCourtDetails($court,Carbon::now(Court::TIME_ZONE));

        return response()->json([
            'message' => 'Court updated successfully.',
            'data' => $court,
        ]);
    }

    public function destroy(Request $request, Court $court): JsonResponse {
        abort_unless($request->user()->role === 'admin',403);

        if (method_exists($court, 'bookings') && $court->bookings()->exists()) {
            return response()->json([
                'message' => 'This court has bookings. Change its status to Closed instead.',
            ], 409);
        }

        $this->courts->delete($court);

        return response()->json([
            'message' => 'Court deleted successfully.',
        ]);
    }

    private function appendCourtDetails(Court $court, Carbon $now): void {
        $operatingStatus = $court->getOperatingStatus($now);

        $court->setAttribute('operating_status',$operatingStatus);
        $court->setAttribute('is_open_now',$court->isOpenNow($now));
        $court->setAttribute('has_valid_booking_configuration',$court->hasValidBookingConfiguration());
        $court->setAttribute('allowed_booking_durations',$court->getAllowedBookingDurations());
    }
}