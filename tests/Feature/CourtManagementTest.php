<?php

namespace Tests\Feature;

use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use App\Models\CourtPricing;
use App\Models\SportCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourtManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected SportCategory $sportCategory;
    protected Court $court;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->sportCategory = SportCategory::create([
            'name' => 'Basketball',
            'slug' => 'basketball',
            'description' => 'Basketball courts',
            'is_active' => true,
        ]);

        $this->court = Court::create([
            'sport_category_id' => $this->sportCategory->id,
            'name' => 'Basketball Court 1',
            'court_number' => '1',
            'branch' => 'Main Branch',
            'location' => 'Davao',
            'min_players' => 4,
            'max_players' => 6,
            'status' => 'available',
            'opening_time' => '08:00',
            'closing_time' => '22:00',
            'booking_interval' => 30,
            'minimum_booking_duration' => 30,
            'maximum_booking_duration' => 90,
            'base_price' => 500,
            'currency' => 'PHP',
            'description' => 'Main basketball court',
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_list_sport_categories(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/v1/sport-categories');
        $response
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'Basketball',
                'slug' => 'basketball',
            ]);
    }

    public function test_authenticated_user_can_update_sport_category(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/sport-categories/{$this->sportCategory->id}", [
                'name' => 'Basketball Updated',
                'slug' => 'basketball-updated',
                'description' => 'Updated description',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('sport_categories', [
            'id' => $this->sportCategory->id,
            'name' => 'Basketball Updated',
            'slug' => 'basketball-updated',
        ]);
    }

    public function test_authenticated_user_can_create_sport_category(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/sport-categories', [
                'name' => 'Tennis',
                'description' => 'Tennis courts',
                'is_active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Tennis')
            ->assertJsonPath('data.slug', 'tennis');

        $this->assertDatabaseHas('sport_categories', [
            'name' => 'Tennis',
            'slug' => 'tennis',
        ]);
    }

    public function test_sport_category_slug_is_automatically_generated_from_name(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/sport-categories', [
                'name' => 'Table Tennis',
                'description' => 'Table tennis courts',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('sport_categories', [
            'name' => 'Table Tennis',
            'slug' => 'table-tennis',
        ]);
    }

    public function test_sport_category_requires_name_and_slug(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/sport-categories', [
                'description' => 'Invalid category',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
            ]);
    }

    public function test_sport_category_slug_is_normalized_from_name(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/sport-categories', [
                'name' => '  Basketball Court  ',
                'description' => 'Basketball court',
                'is_active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Basketball Court')
            ->assertJsonPath('data.slug', 'basketball-court');

        $this->assertDatabaseHas('sport_categories', [
            'name' => 'Basketball Court',
            'slug' => 'basketball-court',
        ]);
    }

    public function test_authenticated_user_can_list_courts(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/courts');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'Basketball Court 1',
                'court_number' => '1',
            ]);
    }

    public function test_authenticated_user_can_create_court(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Basketball Court 2',
                'court_number' => '2',
                'branch' => 'Main Branch',
                'location' => 'Davao',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 600,
                'currency' => 'PHP',
                'description' => 'Second basketball court',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('courts', [
            'name' => 'Basketball Court 2',
            'court_number' => '2',
            'sport_category_id' => $this->sportCategory->id,
            'min_players' => 4,
            'max_players' => 6,
            'status' => 'available',
        ]);
    }

    public function test_court_requires_required_configuration_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'sport_category_id',
                'name',
                'branch',
                'min_players',
                'max_players',
                'status',
                'opening_time',
                'closing_time',
                'booking_interval',
                'minimum_booking_duration',
                'maximum_booking_duration',
                'base_price',
                'currency',
            ]);
    }

    public function test_court_number_is_optional(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Tennis Court 1',
                'branch' => 'Main Branch',
                'min_players' => 2,
                'max_players' => 4,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('courts', [
            'name' => 'Tennis Court 1',
            'court_number' => null,
        ]);
    }

    public function test_court_location_is_optional(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Tennis Court 2',
                'branch' => 'Main Branch',
                'min_players' => 2,
                'max_players' => 4,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('courts', [
            'name' => 'Tennis Court 2',
            'location' => null,
        ]);
    }

    public function test_max_players_must_be_greater_than_or_equal_to_min_players(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Invalid Court',
                'branch' => 'Main Branch',
                'min_players' => 6,
                'max_players' => 4,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'max_players',
            ]);
    }

    public function test_maximum_booking_duration_must_be_greater_than_or_equal_to_minimum(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Invalid Duration Court',
                'branch' => 'Main Branch',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 90,
                'maximum_booking_duration' => 30,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'maximum_booking_duration',
            ]);
    }

    public function test_court_rejects_invalid_status(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Invalid Status Court',
                'branch' => 'Main Branch',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'invalid',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'status',
            ]);
    }

    public function test_court_supports_configurable_minimum_and_maximum_players(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/courts/{$this->court->id}", [
                'sport_category_id' => $this->sportCategory->id,
                'name' => $this->court->name,
                'court_number' => $this->court->court_number,
                'branch' => $this->court->branch,
                'location' => $this->court->location,
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('courts', [
            'id' => $this->court->id,
            'min_players' => 4,
            'max_players' => 6,
        ]);
    }

    public function test_court_rejects_max_players_less_than_min_players(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/courts/{$this->court->id}", [
                'sport_category_id' => $this->sportCategory->id,
                'name' => $this->court->name,
                'court_number' => $this->court->court_number,
                'branch' => $this->court->branch,
                'location' => $this->court->location,
                'min_players' => 6,
                'max_players' => 4,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'max_players',
            ]);
    }

    public function test_court_accepts_available_status(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Available Court',
                'branch' => 'Main Branch',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('courts', [
            'name' => 'Available Court',
            'status' => 'available',
        ]);
    }

    public function test_court_accepts_maintenance_status(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Maintenance Court',
                'branch' => 'Main Branch',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'maintenance',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('courts', [
            'name' => 'Maintenance Court',
            'status' => 'maintenance',
        ]);
    }

    public function test_court_accepts_closed_status(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Closed Court',
                'branch' => 'Main Branch',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'closed',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('courts', [
            'name' => 'Closed Court',
            'status' => 'closed',
        ]);
    }

    public function test_court_accepts_temporarily_blocked_status(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courts', [
                'sport_category_id' => $this->sportCategory->id,
                'name' => 'Temporarily Blocked Court',
                'branch' => 'Main Branch',
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'temporarily_blocked',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('courts', [
            'name' => 'Temporarily Blocked Court',
            'status' => 'temporarily_blocked',
        ]);
    }
    
    public function test_court_stores_opening_and_closing_hours(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/courts/{$this->court->id}", [
                'sport_category_id' => $this->sportCategory->id,
                'name' => $this->court->name,
                'court_number' => $this->court->court_number,
                'branch' => $this->court->branch,
                'location' => $this->court->location,
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '09:00',
                'closing_time' => '21:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('courts', [
            'id' => $this->court->id,
            'opening_time' => '09:00',
            'closing_time' => '21:00',
        ]);
    }

    public function test_court_stores_booking_interval(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/courts/{$this->court->id}", [
                'sport_category_id' => $this->sportCategory->id,
                'name' => $this->court->name,
                'court_number' => $this->court->court_number,
                'branch' => $this->court->branch,
                'location' => $this->court->location,
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('courts', [
            'id' => $this->court->id,
            'booking_interval' => 30,
        ]);
    }

    public function test_court_stores_minimum_and_maximum_booking_duration(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/courts/{$this->court->id}", [
                'sport_category_id' => $this->sportCategory->id,
                'name' => $this->court->name,
                'court_number' => $this->court->court_number,
                'branch' => $this->court->branch,
                'location' => $this->court->location,
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 90,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('courts', [
            'id' => $this->court->id,
            'minimum_booking_duration' => 30,
            'maximum_booking_duration' => 90,
        ]);
    }

    public function test_court_rejects_maximum_duration_less_than_minimum_duration(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/courts/{$this->court->id}", [
                'sport_category_id' => $this->sportCategory->id,
                'name' => $this->court->name,
                'court_number' => $this->court->court_number,
                'branch' => $this->court->branch,
                'location' => $this->court->location,
                'min_players' => 4,
                'max_players' => 6,
                'status' => 'available',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 90,
                'maximum_booking_duration' => 30,
                'base_price' => 500,
                'currency' => 'PHP',
                'is_active' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'maximum_booking_duration',
            ]);
    }

    public function test_authenticated_user_can_create_court_specific_pricing(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/courts/{$this->court->id}/pricings", [
                'pricing_type' => 'hourly',
                'price' => 750,
                'start_time' => '17:00',
                'end_time' => '21:00',
                'is_active' => true,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.court_id', $this->court->id)
            ->assertJsonPath('data.pricing_type', 'hourly')
            ->assertJsonPath('data.price', '750.00');

        $this->assertDatabaseHas('court_pricings', [
            'court_id' => $this->court->id,
            'pricing_type' => 'hourly',
            'price' => 750,
            'start_time' => '17:00',
            'end_time' => '21:00',
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_list_court_pricing(): void
    {
        CourtPricing::create([
            'court_id' => $this->court->id,
            'pricing_type' => 'hourly',
            'price' => 750,
            'start_time' => '17:00',
            'end_time' => '21:00',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/courts/{$this->court->id}/pricings");

        $response
            ->assertOk()
            ->assertJsonFragment([
                'court_id' => $this->court->id,
                'pricing_type' => 'hourly',
                'price' => '750.00',
                'start_time' => '17:00',
                'end_time' => '21:00',
                'is_active' => true,
            ]);
    }

    public function test_authenticated_user_can_update_court_pricing(): void
    {
        $pricing = CourtPricing::create([
            'court_id' => $this->court->id,
            'pricing_type' => 'hourly',
            'price' => 750,
            'start_time' => '17:00',
            'end_time' => '21:00',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/court-pricings/{$pricing->id}", [
                'pricing_type' => 'hourly',
                'price' => 800,
                'start_time' => '18:00',
                'end_time' => '22:00',
                'is_active' => true,
            ]);

        $response
            ->assertSuccessful()
            ->assertJsonPath('data.pricing_type', 'hourly')
            ->assertJsonPath('data.price', '800.00');

        $this->assertDatabaseHas('court_pricings', [
            'id' => $pricing->id,
            'court_id' => $this->court->id,
            'pricing_type' => 'hourly',
            'price' => 800,
            'start_time' => '18:00',
            'end_time' => '22:00',
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_delete_court_pricing(): void
    {
        $pricing = CourtPricing::create([
            'court_id' => $this->court->id,
            'name' => 'Peak Hour',
            'price' => 750,
            'currency' => 'PHP',
            'start_time' => '17:00',
            'end_time' => '21:00',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/court-pricings/{$pricing->id}");

        $response->assertSuccessful();

        $this->assertDatabaseMissing('court_pricings', [
            'id' => $pricing->id,
        ]);
    }

    public function test_authenticated_user_can_create_court_maintenance_period(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/courts/{$this->court->id}/maintenance", [
                'maintenance_date' => '2026-09-28',
                'start_time' => '09:00',
                'end_time' => '12:00',
                'reason' => 'Routine maintenance',
                'notes' => 'Court surface inspection',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.court_id', $this->court->id)
            ->assertJsonPath('data.start_time', '09:00')
            ->assertJsonPath('data.end_time', '12:00')
            ->assertJsonPath('data.reason', 'Routine maintenance')
            ->assertJsonPath('data.notes', 'Court surface inspection');

        $maintenanceDate = $response->json('data.maintenance_date');

        $this->assertStringStartsWith(
            '2026-09-28',
            $maintenanceDate
        );

        $this->assertDatabaseHas('court_maintenance_periods', [
            'court_id' => $this->court->id,
            'maintenance_date' => '2026-09-28 00:00:00',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'reason' => 'Routine maintenance',
            'notes' => 'Court surface inspection',
        ]);
    }

    public function test_authenticated_user_can_list_court_maintenance_periods(): void
    {
        CourtMaintenancePeriod::create([
            'court_id' => $this->court->id,
            'maintenance_date' => '2026-09-28',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'reason' => 'Routine maintenance',
            'notes' => 'Inspection',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/courts/{$this->court->id}/maintenance");

        $response
            ->assertOk()
            ->assertJsonFragment([
                'court_id' => $this->court->id,
                'reason' => 'Routine maintenance',
                'notes' => 'Inspection',
                'start_time' => '09:00',
                'end_time' => '12:00',
                'is_active' => true,
            ]);
    }

    public function test_authenticated_user_can_update_maintenance_period(): void
    {
        $maintenance = CourtMaintenancePeriod::create([
            'court_id' => $this->court->id,
            'maintenance_date' => '2026-09-28',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'reason' => 'Routine maintenance',
            'notes' => 'Inspection',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/maintenance-periods/{$maintenance->id}", [
                'maintenance_date' => '2026-09-28',
                'start_time' => '10:00',
                'end_time' => '14:00',
                'reason' => 'Extended maintenance',
                'notes' => 'Additional court work',
                'is_active' => true,
            ]);

        $response
            ->assertSuccessful()
            ->assertJsonPath('data.reason', 'Extended maintenance')
            ->assertJsonPath('data.notes', 'Additional court work')
            ->assertJsonPath('data.start_time', '10:00')
            ->assertJsonPath('data.end_time', '14:00');

        $this->assertDatabaseHas('court_maintenance_periods', [
            'id' => $maintenance->id,
            'court_id' => $this->court->id,
            'maintenance_date' => '2026-09-28 00:00:00',
            'start_time' => '10:00',
            'end_time' => '14:00',
            'reason' => 'Extended maintenance',
            'notes' => 'Additional court work',
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_delete_maintenance_period(): void
    {
        $maintenance = CourtMaintenancePeriod::create([
            'court_id' => $this->court->id,
            'maintenance_date' => '2026-09-28',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'reason' => 'Routine maintenance',
            'notes' => 'Inspection',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/maintenance-periods/{$maintenance->id}");

        $response->assertSuccessful();

        $this->assertDatabaseMissing('court_maintenance_periods', [
            'id' => $maintenance->id,
        ]);
    }

    public function test_sport_category_has_courts(): void
    {
        $this->assertTrue(
            $this->sportCategory->courts()->whereKey($this->court->id)->exists()
        );
    }

    public function test_court_belongs_to_sport_category(): void
    {
        $this->assertEquals(
            $this->sportCategory->id,
            $this->court->sport_category_id
        );

        $this->assertEquals(
            $this->sportCategory->id,
            $this->court->sportCategory->id
        );
    }

    public function test_unauthenticated_user_can_access_court_listing(): void
    {
        $response = $this->getJson('/api/v1/courts');

        $response->assertOk();
    }

    public function test_unauthenticated_user_cannot_create_court(): void
    {
        $response = $this->postJson('/api/v1/courts', [
            'sport_category_id' => $this->sportCategory->id,
            'name' => 'Unauthorized Court',
            'court_number' => '99',
        ]);

        $response->assertUnauthorized();
    }

    public function test_admin_dashboard_contains_court_utilization(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/admin-dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'court_utilization',
            ]);
    }
}