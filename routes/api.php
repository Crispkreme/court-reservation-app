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
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CourtAvailabilityController;

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
        Route::get('courts/{court}/availability', [CourtAvailabilityController::class, 'index'])->whereNumber('court')->name('courts.availability');

        Route::middleware('admin')
            ->name('admin.')
            ->group(function () {
                Route::apiResource('users', UserController::class);
                Route::patch('users/{user}/role', [UserController::class, 'updateRole'])->whereNumber('user');
                Route::patch('users/{user}/status', [UserController::class, 'updateStatus'])->whereNumber('user');
                Route::apiResource('sport-categories', SportCategoryController::class)->parameters(['sport-categories' => 'sportCategory'])->whereNumber('sportCategory');
                Route::post('courts', [CourtController::class, 'store']);
                Route::match(['put', 'patch'], 'courts/{court}', [CourtController::class, 'update'])->whereNumber('court');
                Route::delete('courts/{court}', [CourtController::class, 'destroy'])->whereNumber('court');
                Route::apiResource('court-maintenance-periods', CourtMaintenancePeriodController::class)->parameters(['court-maintenance-periods' => 'maintenancePeriod']);
                Route::get('court-utilization', [CourtUtilizationController::class, 'index']);
                Route::apiResource('court-recurring-schedules', CourtRecurringScheduleController::class);
                Route::apiResource('court-schedule-overrides', CourtScheduleOverrideController::class)->parameters(['court-schedule-overrides' => 'courtScheduleOverride']);
                Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
                Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
                Route::get('bookings/{booking}', [BookingController::class, 'show'])->whereNumber('booking')->name('bookings.show');
                Route::match(['put', 'patch'], 'bookings/{booking}', [BookingController::class, 'update'])->whereNumber('booking')->name('bookings.update');
                Route::patch('bookings/{booking}/status', [BookingController::class, 'updateStatus'])->whereNumber('booking')->name('bookings.status');
                Route::delete('bookings/{booking}', [BookingController::class, 'destroy'])->whereNumber('booking')->name('bookings.destroy');
                Route::get('courts/{court}/availability', [CourtAvailabilityController::class, 'index'])->whereNumber('court')->name('courts.availability');
            });

        Route::middleware('member')
            ->name('member.')
            ->group(function () {
                Route::get('courts/{court}/court-maintenance-periods', [CourtMaintenancePeriodController::class, 'byCourt'])->whereNumber('court')->name('courts.maintenance-periods');
                Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
                Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
                Route::get('bookings/{booking}', [BookingController::class, 'show'])->whereNumber('booking')->name('bookings.show');
                Route::patch('bookings/{booking}/cancel', [BookingController::class, 'cancel'])->whereNumber('booking')->name('bookings.cancel');
                Route::get('courts/{court}/availability', [CourtAvailabilityController::class, 'index'])->whereNumber('court')->name('courts.availability');
            });
    });

});
