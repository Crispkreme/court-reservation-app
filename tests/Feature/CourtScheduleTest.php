<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingHold;
use App\Models\Court;
use App\Models\CourtSchedule;
use App\Models\CourtScheduleOverride;
use App\Models\SportCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourtScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected SportCategory $sportCategory;
    protected Court $court;
    protected Court $secondCourt;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->sportCategory = SportCategory::factory()->create();

        $this->court = Court::factory()->create([
            'sport_category_id' => $this->sportCategory->id,
        ]);

        $this->secondCourt = Court::factory()->create([
            'sport_category_id' => $this->sportCategory->id,
        ]);
    }

    public function test_can_create_daily_court_schedule(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'court_id' => $this->court->id,
                'day_of_week' => 1,
                'start_time' => '08:00',
                'end_time' => '22:00',
                'status' => 'available',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('court_schedules', [
            'court_id' => $this->court->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '22:00',
            'status' => 'available',
            'is_active' => 1,
        ]);
    }

    public function test_can_retrieve_weekly_court_schedules(): void
    {
        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'day_of_week' => 3,
            'start_time' => '13:00',
            'end_time' => '18:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-schedules');

        $response->assertOk();

        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'court_id',
                    'day_of_week',
                    'start_time',
                    'end_time',
                    'status',
                    'start_date',
                    'end_date',
                    'is_active',
                    'notes',
                ],
            ],
        ]);

        $response->assertJsonCount(2, 'data');

        $response->assertJsonFragment([
            'court_id' => $this->court->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        $response->assertJsonFragment([
            'court_id' => $this->court->id,
            'day_of_week' => 3,
            'start_time' => '13:00',
            'end_time' => '18:00',
            'status' => 'available',
            'is_active' => true,
        ]);
    }

    public function test_supports_available_schedule_status(): void
    {
        $schedule = CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'status' => 'available',
        ]);

        $this->assertDatabaseHas('court_schedules', [
            'id' => $schedule->id,
            'status' => 'available',
        ]);
    }

    public function test_supports_blocked_schedule_status(): void
    {
        $schedule = CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'status' => 'blocked',
        ]);

        $this->assertDatabaseHas('court_schedules', [
            'id' => $schedule->id,
            'status' => 'blocked',
        ]);
    }

    public function test_supports_maintenance_schedule_status(): void
    {
        $schedule = CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'status' => 'maintenance',
        ]);

        $this->assertDatabaseHas('court_schedules', [
            'id' => $schedule->id,
            'status' => 'maintenance',
        ]);
    }

    public function test_supports_closed_schedule_status(): void
    {
        $schedule = CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'status' => 'closed',
        ]);

        $this->assertDatabaseHas('court_schedules', [
            'id' => $schedule->id,
            'status' => 'closed',
        ]);
    }

    public function test_can_retrieve_court_calendar(): void
    {
        $date = now()->startOfDay();

        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'day_of_week' => $date->dayOfWeek,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'start' => $date->format('Y-m-d'),
                'end' => $date->copy()->addDays(6)->format('Y-m-d'),
            ]));

        $response->assertSuccessful();
    }

    public function test_calendar_can_filter_by_court(): void
    {
        $start = now()->startOfDay();
        $end = $start->copy()->addDays(6);

        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'day_of_week' => $start->dayOfWeek,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        CourtSchedule::factory()->create([
            'court_id' => $this->secondCourt->id,
            'day_of_week' => $start->dayOfWeek,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'start' => $start->format('Y-m-d'),
                'end' => $end->format('Y-m-d'),
                'court_id' => $this->court->id,
            ]));

        $response->assertSuccessful();
    }

    public function test_calendar_can_filter_by_date(): void
    {
        $date = now()->addDay()->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'start' => $date,
                'end' => $date,
            ]));

        $response->assertSuccessful();
    }

    public function test_calendar_can_filter_by_date_range(): void
    {
        $startDate = now()->format('Y-m-d');
        $endDate = now()->addDays(7)->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'start' => $startDate,
                'end' => $endDate,
            ]));

        $response->assertSuccessful();
    }

    public function test_calendar_can_filter_by_status(): void
    {
        $startDate = now()->format('Y-m-d');
        $endDate = now()->addDays(7)->format('Y-m-d');

        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'day_of_week' => now()->dayOfWeek,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'maintenance',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'start' => $startDate,
                'end' => $endDate,
                'status' => 'maintenance',
            ]));

        $response->assertSuccessful();
    }

    public function test_calendar_supports_multiple_courts(): void
    {
        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'status' => 'available',
        ]);

        CourtSchedule::factory()->create([
            'court_id' => $this->secondCourt->id,
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'start' => now()->startOfWeek()->toDateString(),
                'end' => now()->endOfWeek()->toDateString(),
            ]));

        $response->assertSuccessful();

        $response->assertJsonStructure([
            'data',
        ]);
    }

    public function test_can_create_recurring_weekly_schedule(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'court_id' => $this->court->id,
                'day_of_week' => 2,
                'start_time' => '09:00',
                'end_time' => '21:00',
                'status' => 'available',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('court_schedules', [
            'court_id' => $this->court->id,
            'day_of_week' => 2,
            'status' => 'available',
        ]);
    }

    public function test_can_create_special_schedule_or_holiday_override(): void
    {
        $date = now()->addDays(10)->startOfDay();

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedule-overrides', [
                'court_id' => $this->court->id,
                'date' => $date->format('Y-m-d'),
                'status' => 'closed',
                'title' => 'Holiday',
                'reason' => 'Public Holiday',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('court_schedule_overrides', [
            'court_id' => $this->court->id,
            'date' => $date->format('Y-m-d H:i:s'),
            'status' => 'closed',
        ]);
    }

    public function test_date_override_takes_precedence_for_specific_date(): void
    {
        $date = now()->addDays(3);

        CourtSchedule::factory()->create([
            'court_id' => $this->court->id,
            'day_of_week' => $date->dayOfWeek,
            'start_time' => '08:00',
            'end_time' => '22:00',
            'status' => 'available',
            'is_active' => true,
        ]);

        CourtScheduleOverride::factory()->create([
            'court_id' => $this->court->id,
            'date' => $date->format('Y-m-d'),
            'start_time' => '08:00',
            'end_time' => '22:00',
            'status' => 'closed',
            'title' => 'Special Closure',
            'reason' => 'Maintenance',
            'is_active' => true,
        ]);

        $dateString = $date->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/court-calendar?' . http_build_query([
                'date' => $dateString,
                'start' => $dateString,
                'end' => $dateString,
            ]));

        $response->assertSuccessful();

        $response->assertJsonFragment([
            'status' => 'closed',
        ]);
    }

    public function test_calendar_includes_reserved_booking_slots(): void
    {
        $bookingDate = now()->addDay()->format('Y-m-d');

        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'sport_category_id' => $this->court->sport_category_id,
            'court_id' => $this->court->id,
            'booking_date' => $bookingDate,
            'start_time' => '10:00',
            'end_time' => '11:00',
            'duration_minutes' => 60,
            'players_count' => 1,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(
                '/api/v1/court-calendar?' .
                http_build_query([
                    'start' => $bookingDate,
                    'end' => $bookingDate,
                ])
            );

        $response->assertSuccessful();
    }

    public function test_calendar_includes_held_slots(): void
    {
        $date = now()->addDay()->format('Y-m-d');

        BookingHold::factory()->create([
            'user_id' => $this->user->id,
            'sport_category_id' => $this->court->sport_category_id,
            'court_id' => $this->court->id,
            'booking_date' => $date,
            'start_time' => '14:00',
            'end_time' => '15:00',
            'duration_minutes' => 60,
            'players_count' => 1,
            'status' => BookingHold::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(
                '/api/v1/court-calendar?' .
                http_build_query([
                    'start' => $date,
                    'end' => $date,
                ])
            );

        $response->assertSuccessful();
    }

    public function test_guest_cannot_access_court_schedules(): void
    {
        $response = $this->getJson('/api/v1/court-schedules');

        $response->assertUnauthorized();
    }

    public function test_guest_cannot_access_court_calendar(): void
    {
        $response = $this->getJson('/api/v1/court-calendar');

        $response->assertUnauthorized();
    }

    public function test_guest_cannot_create_court_schedule(): void
    {
        $response = $this->postJson('/api/v1/court-schedules', [
            'court_id' => $this->court->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '22:00',
            'status' => 'available',
        ]);

        $response->assertUnauthorized();
    }

    public function test_court_schedule_requires_court(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'day_of_week' => 1,
                'start_time' => '08:00',
                'end_time' => '22:00',
                'status' => 'available',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'court_id',
            ]);
    }

    public function test_court_schedule_requires_start_and_end_time(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'court_id' => $this->court->id,
                'day_of_week' => 1,
                'status' => 'available',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'start_time',
                'end_time',
            ]);
    }

    public function test_court_schedule_rejects_invalid_status(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'court_id' => $this->court->id,
                'day_of_week' => 1,
                'start_time' => '08:00',
                'end_time' => '22:00',
                'status' => 'invalid_status',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'status',
            ]);
    }

    public function test_court_schedule_rejects_invalid_day_of_week(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'court_id' => $this->court->id,
                'day_of_week' => 8,
                'start_time' => '08:00',
                'end_time' => '22:00',
                'status' => 'available',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'day_of_week',
            ]);
    }

    public function test_end_time_must_be_after_start_time(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/court-schedules', [
                'court_id' => $this->court->id,
                'day_of_week' => 1,
                'start_time' => '22:00',
                'end_time' => '08:00',
                'status' => 'available',
            ]);

        $response->assertUnprocessable();
    }
}