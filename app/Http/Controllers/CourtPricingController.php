<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\CourtPricing;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use App\Http\Requests\StoreCourtPricingRequest;
use App\Http\Requests\UpdateCourtPricingRequest;


class CourtPricingController extends Controller
{
    public function index(Court $court)
    {
        return response()->json(
            $court->pricings()
                ->latest()
                ->get()
        );
    }

    public function store(StoreCourtPricingRequest $request,Court $court) {
        $validated = $request->validated();

        $pricing = $court
            ->pricings()
            ->create($validated);

        return response()->json([
            'message' => 'Court pricing created successfully.',
            'data' => $pricing,
        ], 201);
    }

    public function update(
        UpdateCourtPricingRequest $request,
        CourtPricing $courtPricing
    ) {
        $validated = $request->validated();

        $courtPricing->update($validated);

        return response()->json([
            'message' => 'Court pricing updated successfully.',
            'data' => $courtPricing->fresh(),
        ]);
    }

    public function destroy(CourtPricing $courtPricing)
    {
        $courtPricing->delete();

        return response()->json([
            'message' => 'Court pricing deleted successfully.',
        ]);
    }
}