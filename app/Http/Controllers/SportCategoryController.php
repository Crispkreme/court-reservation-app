<?php

namespace App\Http\Controllers;

use App\Http\Requests\SportCategories\StoreSportCategoryRequest;
use App\Http\Requests\SportCategories\UpdateSportCategoryRequest;
use App\Interfaces\SportCategoryRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SportCategoryController extends Controller
{
    public function __construct(
        private SportCategoryRepositoryInterface $categories
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => [
                'sometimes',
                'nullable',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->categories->all($filters),
        ]);
    }

    public function show(int $sportCategory): JsonResponse
    {
        $category = $this->categories->find($sportCategory);

        if (!$category) {
            return $this->notFound();
        }

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    public function store(
        StoreSportCategoryRequest $request
    ): JsonResponse {
        $category = $this->categories->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Sport category created successfully.',
            'data' => $category,
        ], 201);
    }

    public function update(
        UpdateSportCategoryRequest $request,
        int $sportCategory
    ): JsonResponse {
        $category = $this->categories->update(
            $sportCategory,
            $request->validated()
        );

        if (!$category) {
            return $this->notFound();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sport category updated successfully.',
            'data' => $category,
        ]);
    }

    public function destroy(int $sportCategory): JsonResponse
    {
        $category = $this->categories->find($sportCategory);

        if (!$category) {
            return $this->notFound();
        }

        $this->categories->delete($sportCategory);

        return response()->json([
            'success' => true,
            'message' => 'Sport category deleted successfully.',
        ]);
    }

    private function notFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Sport category not found.',
        ], 404);
    }
}
