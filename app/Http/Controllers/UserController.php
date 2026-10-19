<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->select('id', 'name', 'email', 'role')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        return response()->json(
            $query->paginate($request->integer('per_page', 15))
        );
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $user->only([
                'id',
                'name',
                'email',
                'role',
            ]),
        ]);
    }

    public function members(): JsonResponse
    {
        $members = User::query()
            ->where('role', 'member')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json([
            'message' => 'Members retrieved successfully.',
            'data' => $members,
        ]);
    }
}