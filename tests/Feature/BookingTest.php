<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Court;
use App\Models\SportCategory;
use App\Models\User;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected SportCategory $sportCategory;
    protected Court $court;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->sportCategory = SportCategory::factory()->create();

        $this->court = Court::factory()->create([
            'sport_category_id' => $this->sportCategory->id,
        ]);
    }

    public function test_authenticated_customer_can_create_booking(): void
    {
        $bookingDate = now()->addDays(2)->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/bookings', [
                'sport_category_id' => $this->sportCategory->id,
                'court_id' => $this->court->id,
                'booking_date' => $bookingDate,
                'start_time' => '10:00',
                'duration_minutes' => 60,
                'players_count' => 2,

                'customer_name' => $this->user->name,
                'customer_email' => $this->user->email,
                'customer_phone' => '09123456789',

                'membership_type' => null,
                'notes' => 'Test booking',
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('bookings', [
            'user_id' => $this->user->id,
            'sport_category_id' => $this->sportCategory->id,
            'court_id' => $this->court->id,
            'booking_date' => $bookingDate . ' 00:00:00',
            'start_time' => '10:00:00',
            'duration_minutes' => 60,
            'players_count' => 2,
        ]);
    }

    public function test_authenticated_customer_can_make_online_booking(): void
    {
        $bookingDate = now()->addDays(2)->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/bookings', [
                'sport_category_id' => $this->sportCategory->id,
                'court_id' => $this->court->id,
                'booking_date' => $bookingDate,
                'start_time' => '11:00',
                'duration_minutes' => 30,
                'players_count' => 1,
                'booking_source' => 'online',
                'customer_name' => $this->user->name,
                'customer_email' => $this->user->email,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('bookings', [
            'user_id' => $this->user->id,
            'court_id' => $this->court->id,
            'booking_date' => $bookingDate,
            'start_time' => '11:00',
            'duration_minutes' => 30,
        ]);
    }
}
