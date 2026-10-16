<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\OperationalControl;
use App\Models\User;
use Illuminate\Database\Seeder;

class OperationalControlSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()
            ->where('is_admin', true)
            ->first();

        if (!$admin) {
            $admin = User::query()->first();
        }

        if (!$admin) {
            return;
        }

        $courts = Court::query()
            ->orderBy('id')
            ->get();

        $court1 = $courts->get(0);
        $court2 = $courts->get(1);

        OperationalControl::query()->delete();

        /*
         * Court maintenance.
         */
        if ($court1) {
            OperationalControl::create([
                'control_type' => 'maintenance',
                'court_id' => $court1->id,
                'user_id' => $admin->id,
                'authorized_by' => $admin->id,
                'status' => 'active',
                'starts_at' => now()->addDay()->setTime(8, 0),
                'ends_at' => now()->addDay()->setTime(12, 0),
                'reason' => 'Scheduled court maintenance.',
                'notes' => 'Surface inspection and equipment maintenance.',
                'allowed_roles' => [
                    'admin',
                    'manager',
                    'operations',
                ],
                'performed_at' => now(),
            ]);
        }

        /*
         * Tournament/event block.
         */
        if ($court2) {
            OperationalControl::create([
                'control_type' => 'tournament_event',
                'court_id' => $court2->id,
                'user_id' => $admin->id,
                'authorized_by' => $admin->id,
                'status' => 'active',
                'starts_at' => now()->addDays(3)->setTime(8, 0),
                'ends_at' => now()->addDays(3)->setTime(18, 0),
                'reason' => 'Regional tournament.',
                'notes' => 'Court reserved for tournament operations.',
                'allowed_roles' => [
                    'admin',
                    'manager',
                    'event_manager',
                ],
                'performed_at' => now(),
            ]);
        }

        /*
         * Temporary closure.
         */
        if ($court1) {
            OperationalControl::create([
                'control_type' => 'temporary_closure',
                'court_id' => $court1->id,
                'user_id' => $admin->id,
                'authorized_by' => $admin->id,
                'status' => 'active',
                'starts_at' => now()->addDays(7)->setTime(10, 0),
                'ends_at' => now()->addDays(7)->setTime(14, 0),
                'reason' => 'Temporary facility closure.',
                'notes' => 'Facility inspection.',
                'allowed_roles' => [
                    'admin',
                    'manager',
                    'operations',
                ],
                'performed_at' => now(),
            ]);
        }

        /*
         * Limited booking window.
         */
        OperationalControl::create([
            'control_type' => 'booking_window',
            'user_id' => $admin->id,
            'authorized_by' => $admin->id,
            'status' => 'active',
            'minimum_advance_hours' => 2,
            'maximum_advance_days' => 30,
            'reason' => 'Standard operational booking window.',
            'notes' => 'Customers must book at least two hours ahead and no more than 30 days ahead.',
            'allowed_roles' => [
                'admin',
                'manager',
                'operations',
            ],
            'performed_at' => now(),
        ]);

        /*
         * Rule override example.
         */
        OperationalControl::create([
            'control_type' => 'rule_override',
            'user_id' => $admin->id,
            'authorized_by' => $admin->id,
            'status' => 'active',
            'override_rules' => [
                'daily_booking_limit' => 5,
                'max_duration_minutes' => 240,
                'advance_days' => 60,
            ],
            'starts_at' => now(),
            'ends_at' => now()->addDays(30),
            'reason' => 'Special operational rule override.',
            'notes' => 'Used for approved special events.',
            'allowed_roles' => [
                'admin',
                'manager',
            ],
            'performed_at' => now(),
        ]);
    }
}