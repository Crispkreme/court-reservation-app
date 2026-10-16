<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SportCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use App\Http\Requests\StoreSportCategoryRequest;
use App\Http\Requests\UpdateSportCategoryRequest;

class SportCategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            SportCategory::withCount('courts')
                ->latest()
                ->paginate(15)
        );
    }

    public function store(StoreSportCategoryRequest $request)
    {
        $validated = $request->validated();

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $category = SportCategory::create($validated);

        return response()->json([
            'message' => 'Sport category created successfully.',
            'data' => $category,
        ], 201);
    }

    public function show(SportCategory $sportCategory)
    {
        return response()->json(
            $sportCategory->load('courts')
        );
    }

    public function update(
        UpdateSportCategoryRequest $request,
        SportCategory $sportCategory
    ) {
        $validated = $request->validated();
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $sportCategory->update($validated);

        return response()->json([
            'message' => 'Sport category updated successfully.',
            'data' => $sportCategory->fresh(),
        ]);
    }

    public function destroy(SportCategory $sportCategory)
    {
        if ($sportCategory->courts()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a sport category that has courts.',
            ], 422);
        }

        $sportCategory->delete();

        return response()->json([
            'message' => 'Sport category deleted successfully.',
        ]);
    }
}