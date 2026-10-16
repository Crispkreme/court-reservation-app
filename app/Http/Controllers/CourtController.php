<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Court;
use Illuminate\Validation\Rule;

use App\Http\Requests\IndexCourtRequest;
use App\Http\Requests\UpdateCourtRequest;
use App\Http\Requests\StoreCourtRequest;

class CourtController extends Controller
{
    public function index(IndexCourtRequest $request)
    {
        $validated = $request->validated();
        $query = Court::with('sportCategory');
        $query->when(
            !empty($validated['sport_category_id']),
            fn ($query) => $query->where(
                'sport_category_id',
                $validated['sport_category_id']
            )
        );

        $query->when(
            !empty($validated['status']),
            fn ($query) => $query->where(
                'status',
                $validated['status']
            )
        );

        $query->when(
            !empty($validated['branch']),
            fn ($query) => $query->where(
                'branch',
                $validated['branch']
            )
        );

        $query->when(
            !empty($validated['search']),
            function ($query) use ($validated) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name','like',"%{$search}%")
                      ->orWhere('court_number','like',"%{$search}%")
                      ->orWhere('branch','like',"%{$search}%")
                      ->orWhere('location','like',"%{$search}%");
                });
            }
        );

        return response()->json(
            $query->latest()
                  ->paginate($validated['per_page'] ?? 15)
        );
    }

    public function store(StoreCourtRequest $request)
    {
        $validated = $request->validated();

        $court = Court::create($validated);

        return response()->json([
            'message' => 'Court created successfully.',
            'data' => $court->load('sportCategory'),
        ], 201);
    }

    public function show(Court $court)
    {
        return response()->json(
            $court->load([
                'sportCategory',
                'pricings',
                'maintenancePeriods',
            ])
        );
    }

    public function update(UpdateCourtRequest $request, Court $court)
    {
        $validated = $request->validated();

        $court->update($validated);

        return response()->json([
            'message' => 'Court updated successfully.',
            'data' => $court->fresh()->load('sportCategory'),
        ]);
    }

    public function destroy(Court $court)
    {
        $court->delete();

        return response()->json([
            'message' => 'Court deleted successfully.',
        ]);
    }
}