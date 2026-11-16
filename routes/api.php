<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfilePasswordController;
use App\Http\Controllers\SportCategoryController;
use App\Http\Controllers\CourtController;
use App\Http\Controllers\CourtMaintenancePeriodController;
use App\Http\Controllers\CourtUtilizationController;
use App\Http\Controllers\CourtScheduleController;
use App\Http\Controllers\CourtRecurringScheduleController;
use App\Http\Controllers\CourtScheduleOverrideController;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('auth')->group(function () {
            Route::get('/user', [AuthController::class, 'user']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });

        Route::patch('/profile/password', [ProfilePasswordController::class,'update'])->middleware('throttle:6,1');
        Route::get('/courts', [CourtController::class, 'index']);
        Route::get('/courts/{court}', [CourtController::class, 'show'])->whereNumber('court');
        Route::get('court-schedules', [CourtScheduleController::class, 'index']);

        Route::middleware('admin')->group(function () {
            Route::apiResource('users',UserController::class);
            Route::patch('/users/{user}/role', [UserController::class,'updateRole'])->whereNumber('user');
            Route::patch('/users/{user}/status', [UserController::class,'updateStatus'])->whereNumber('user');
            Route::apiResource('sport-categories',SportCategoryController::class)->parameters(['sport-categories' => 'sportCategory'])->whereNumber('sportCategory');
            Route::post('/courts', [CourtController::class, 'store']);
            Route::match(['put', 'patch'], '/courts/{court}', [CourtController::class, 'update'])->whereNumber('court');
            Route::delete('/courts/{court}', [CourtController::class, 'destroy'])->whereNumber('court');
            Route::apiResource('court-maintenance-periods',CourtMaintenancePeriodController::class)->parameters(['court-maintenance-periods' => 'maintenancePeriod']);
            Route::get('court-utilization',[CourtUtilizationController::class, 'index']);
            Route::apiResource('court-recurring-schedules',CourtRecurringScheduleController::class);
            Route::apiResource('court-schedule-overrides',CourtScheduleOverrideController::class)->parameters(['court-schedule-overrides' => 'courtScheduleOverride']);
        });

        Route::middleware('member')->group(function () {

            Route::get('courts/{court}/court-maintenance-periods',[CourtMaintenancePeriodController::class, 'byCourt']);

        });

    });

});
