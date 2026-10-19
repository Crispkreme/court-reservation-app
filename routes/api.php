<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\SportCategoryController;
use App\Http\Controllers\CourtController;
use App\Http\Controllers\CourtPricingController;
use App\Http\Controllers\CourtMaintenancePeriodController;
use App\Http\Controllers\CourtCalendarController;
use App\Http\Controllers\CourtScheduleController;
use App\Http\Controllers\CourtScheduleOverrideController;

use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingHoldController;
use App\Http\Controllers\BookingStatusController;
use App\Http\Controllers\BookingRuleController;
use App\Http\Controllers\BookingCancellationController;
use App\Http\Controllers\BookingRescheduleController;
use App\Http\Controllers\CancellationPolicyController;

use App\Http\Controllers\MemberController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\PlayerInvitationController;

use App\Http\Controllers\MembershipController;
use App\Http\Controllers\MembershipTypeController;
use App\Http\Controllers\MembershipTierController;
use App\Http\Controllers\MembershipPrivilegeController;

use App\Http\Controllers\MatchmakingController;

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\OutstandingPaymentController;

use App\Http\Controllers\OperationalControlController;
use App\Http\Controllers\ReservationNotificationController;

use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\MemberDashboardController;

use App\Http\Controllers\FailureExceptionController;

use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuditLogController;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::apiResource('sport-categories', SportCategoryController::class);
    Route::get('courts', [CourtController::class, 'index']);
    Route::apiResource('court-schedule-overrides', CourtScheduleOverrideController::class);

    Route::get('bookings/availability',[BookingController::class, 'availability']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('court-calendar',[CourtCalendarController::class, 'index']);
        Route::prefix('auth')->group(function () {
            Route::get('/user', [AuthController::class,'user']);
            Route::post('/logout', [AuthController::class,'logout']);
        });
        
        Route::post('courts', [CourtController::class, 'store']); 
        Route::get('courts/{court}', [CourtController::class, 'show']); 
        Route::put('courts/{court}', [CourtController::class, 'update']); 
        Route::patch('courts/{court}', [CourtController::class, 'update']); 
        Route::delete('courts/{court}', [CourtController::class, 'destroy']);
        
        Route::prefix('courts')->group(function () {
            Route::get('/{court}/pricings', [CourtPricingController::class,'index']);
            Route::post('/{court}/pricings', [CourtPricingController::class,'store']);
            Route::get('/{court}/maintenance', [CourtMaintenancePeriodController::class,'index']);
            Route::post('/{court}/maintenance', [CourtMaintenancePeriodController::class,'store']);
        });

        Route::apiResource('court-schedules', CourtScheduleController::class);
        Route::put('court-pricings/{courtPricing}', [CourtPricingController::class, 'update']);
        Route::delete('court-pricings/{courtPricing}', [CourtPricingController::class, 'destroy']);
        Route::put('maintenance-periods/{maintenancePeriod}',[CourtMaintenancePeriodController::class, 'update']);
        Route::delete('maintenance-periods/{maintenancePeriod}',[CourtMaintenancePeriodController::class, 'destroy']);

        Route::prefix('bookings')->group(function () {
            Route::get('/', [BookingController::class,'index']);
            Route::post('/', [BookingController::class,'store']);
            Route::post('/{booking}/cancellation/preview', [BookingCancellationController::class,'preview']);
            Route::post('/{booking}/cancel', [BookingCancellationController::class,'store']);
            Route::get('/{booking}/reschedule', [BookingRescheduleController::class,'show']);
            Route::post('/{booking}/reschedule/preview', [BookingRescheduleController::class,'preview']);
            Route::post('/{booking}/reschedule', [BookingRescheduleController::class,'store']);
            Route::get('/{booking}/reschedules', [BookingRescheduleController::class,'history']);
            Route::post('/{booking}/players', [PlayerController::class,'addToBooking']);
            Route::patch('/{booking}/players/{bookingPlayer}', [PlayerController::class, 'updateParticipant']);
            Route::delete('/{booking}/players/{bookingPlayer}', [PlayerController::class, 'removeFromBooking']);
            Route::post('/{booking}/player-invitations', [PlayerInvitationController::class, 'store']);
            Route::get('/{booking}', [BookingController::class,'show']);
        });

        Route::get('lookup', [BookingRescheduleController::class, 'lookup']);

        Route::prefix('booking-holds')->group(function () {
            Route::get('/', [BookingHoldController::class,'index']);
            Route::post('/', [BookingHoldController::class,'store']);
            Route::get('/release-expired', [BookingHoldController::class,'releaseExpired']);
            Route::get('/{bookingHold}', [BookingHoldController::class,'show']);
            Route::post('/{bookingHold}/convert', [BookingHoldController::class,'convert']);
            Route::post('/{bookingHold}/fail', [BookingHoldController::class,'fail']);
            Route::post('/{bookingHold}/release', [BookingHoldController::class,'release']);
        });

        Route::prefix('booking-statuses')->group(function () {
            Route::get('/', [BookingStatusController::class,'statuses']);
            Route::get('/bookings', [BookingStatusController::class,'index']);
            Route::get('/bookings/{booking}/history', [BookingStatusController::class,'history']);
            Route::post('/bookings/{booking}/status', [BookingStatusController::class, 'updateStatus']);
        });

        Route::apiResource('booking-rules',BookingRuleController::class);
        Route::apiResource('cancellation-policies',CancellationPolicyController::class);
        Route::apiResource('members',MemberController::class);
        Route::apiResource('players',PlayerController::class);

        Route::prefix('player-invitations')->group(function () {
            Route::get('/', [PlayerInvitationController::class, 'index']);
            Route::post('/{token}/respond', [PlayerInvitationController::class,'respond']);
            Route::get('/{token}', [PlayerInvitationController::class,'show']);
        });

        Route::prefix('memberships')->group(function () {
            Route::get('/statistics', [MembershipController::class,'statistics']);
            Route::get('/expiring', [MembershipController::class,'expiring']);
            Route::post('/{membership}/renew', [MembershipController::class,'renew']);
            Route::post('/{membership}/suspend', [MembershipController::class,'suspend']);
            Route::post('/{membership}/cancel', [MembershipController::class,'cancel']);
        });
        
        Route::apiResource('membership-types',MembershipTypeController::class);
        Route::get('membership-tiers',[MembershipTierController::class, 'index']);
        Route::apiResource('memberships',MembershipController::class);
        Route::apiResource('membership-privileges',MembershipPrivilegeController::class);
        Route::get('membership-privileges-membership-types', [MembershipPrivilegeController::class, 'membershipTypes']);

        Route::prefix('matchmaking')->group(function () {
            Route::get('/', [MatchmakingController::class,'index']);
            Route::post('/', [MatchmakingController::class,'store']);
            Route::get('/{matchmakingRequest}/compatible-players', [MatchmakingController::class, 'compatiblePlayers']);
            Route::post('/{matchmakingRequest}/invite', [MatchmakingController::class, 'invite']);
            Route::post('/{matchmakingRequest}/close', [MatchmakingController::class, 'close']);
            Route::get('/{matchmakingRequest}', [MatchmakingController::class,'show']);
        });

        Route::prefix('payments')->group(function () {
            Route::get('/', [PaymentController::class,'index']);
            Route::post('/', [PaymentController::class,'store']);
            Route::post('/paypal/create-order', [PaymentController::class,'createPaypalOrder']);
            Route::post('/paypal/capture-order', [PaymentController::class,'capturePaypalOrder']);
            Route::post('/reconcile', [PaymentController::class,'reconcile']);
            Route::post('/{payment}/manual-confirm', [PaymentController::class,'confirmManualPayment']);
            Route::post('/{payment}/refund', [PaymentController::class,'refund']);
        });

        Route::apiResource('transactions', TransactionController::class);

        Route::prefix('outstanding-payments')->group(function () {
            Route::get('/summary', [OutstandingPaymentController::class,'summary']);
            Route::get('/export', [OutstandingPaymentController::class,'export']);
            Route::post('/{outstandingPayment}/follow-up', [OutstandingPaymentController::class,'followUp']);
        });

        Route::apiResource('outstanding-payments',OutstandingPaymentController::class);

        Route::prefix('operational-controls')->group(function () {
            Route::get('/', [OperationalControlController::class,'index']);
            Route::post('/', [OperationalControlController::class,'store']);
            Route::get('/summary', [OperationalControlController::class,'summary']);
            Route::post('/manual-booking', [OperationalControlController::class,'manualBooking']);
            Route::post('/rule-override', [OperationalControlController::class,'overrideRules']);
            Route::post('/bookings/{booking}/cancel',[OperationalControlController::class,'manualCancellation']);
            Route::post('/bookings/{booking}/reschedule',[OperationalControlController::class,'manualReschedule']);
            Route::post('/bookings/{booking}/refund',[OperationalControlController::class,'manualRefund']);
            Route::get('/{operationalControl}', [OperationalControlController::class,'show']);
            Route::put('/{operationalControl}', [OperationalControlController::class,'update']);
            Route::delete('/{operationalControl}', [OperationalControlController::class,'destroy']);
        });

        Route::prefix('reservation-notifications')->group(function () {
            Route::get('/', [ReservationNotificationController::class,'index']);
            Route::post('/', [ReservationNotificationController::class,'store']);
            Route::get('/summary', [ReservationNotificationController::class,'summary']);
            Route::get('/unread-count', [ReservationNotificationController::class,'unreadCount']);
            Route::post('/mark-all-read', [ReservationNotificationController::class,'markAllAsRead']);
            Route::post('/{reservationNotification}/read',[ReservationNotificationController::class,'markAsRead']);
            Route::post('/{reservationNotification}/unread',[ReservationNotificationController::class,'markAsUnread']);
            Route::get('/{reservationNotification}',[ReservationNotificationController::class,'show']);
            Route::delete('/{reservationNotification}',[ReservationNotificationController::class,'destroy']);
        });

        Route::prefix('customer-dashboard')->group(function () {
            Route::get('/', [CustomerDashboardController::class,'index']);
            Route::get('/settings', [CustomerDashboardController::class,'settings']);
            Route::put('/settings', [CustomerDashboardController::class,'updateSettings']);
        });

        Route::prefix('member-dashboard')->group(function () {
            Route::get('/', [MemberDashboardController::class,'index']);
        });

        Route::prefix('admin-dashboard')->group(function () {
            Route::get('/', [AdminDashboardController::class,'index']);
            Route::get('/settings', [AdminDashboardController::class,'settings']);
            Route::put('/settings', [AdminDashboardController::class,'updateSettings']);
        });

        Route::prefix('failure-exceptions')->group(function () {
            Route::get('/', [FailureExceptionController::class,'index']);
            Route::post('/', [FailureExceptionController::class,'store']);
            Route::get('/summary', [FailureExceptionController::class,'summary']);
            Route::post('/{failureException}/retry',[FailureExceptionController::class,'retry']);
            Route::post('/{failureException}/resolve',[FailureExceptionController::class,'resolve']);
            Route::post('/{failureException}/ignore',[FailureExceptionController::class,'ignore']);
            Route::post('/{failureException}/reopen',[FailureExceptionController::class,'reopen']);
            Route::get('/{failureException}',[FailureExceptionController::class,'show']);
            Route::delete('/{failureException}',[FailureExceptionController::class,'destroy']);
        });

        Route::prefix('reports')->group(function () {
            Route::get('/', [ReportController::class,'index']);
            Route::get('/csv', [ReportController::class,'csv']);
            Route::get('/pdf', [ReportController::class,'pdf']);
        });

        Route::prefix('audit-logs')->group(function () {
            Route::get('/', [AuditLogController::class,'index']);
            Route::get('/summary', [AuditLogController::class,'summary']);
            Route::get('/modules', [AuditLogController::class,'modules']);
            Route::get('/actions', [AuditLogController::class,'actions']);
            Route::get('/{auditLog}', [AuditLogController::class,'show']);
        });
    });
});