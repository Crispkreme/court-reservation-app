<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipType;

class MembershipSeeder extends Seeder
{
    public function run(): void
    {
        $members = Member::orderBy('id')->get();
        $types = MembershipType::where('is_active', true)
            ->orderBy('id')
            ->get();

        if ($members->isEmpty()) {
            $this->command->error(
                'No members found. Run MemberSeeder first.'
            );
            return;
        }

        if ($types->isEmpty()) {
            $this->command->error(
                'No active membership types found. Run MembershipTypeSeeder first.'
            );
            return;
        }

        $today = today();

        $samples = [
            [
                'member_index' => 0,
                'type_index' => 0,
                'status' => 'active',
                'start_date' => $today->copy()->subDays(10),
                'expiration_date' => $today->copy()->addDays(3),
                'notes' => 'Active membership expiring soon.',
            ],
            [
                'member_index' => 1,
                'type_index' => 1,
                'status' => 'active',
                'start_date' => $today->copy()->subDays(5),
                'expiration_date' => $today->copy()->addDays(7),
                'notes' => 'Active membership expiring within seven days.',
            ],
            [
                'member_index' => 0,
                'type_index' => 2,
                'status' => 'active',
                'start_date' => $today->copy()->subDays(10),
                'expiration_date' => $today->copy()->addDays(30),
                'notes' => 'Regular active VIP membership.',
            ],
            [
                'member_index' => 1,
                'type_index' => 0,
                'status' => 'pending',
                'start_date' => $today->copy(),
                'expiration_date' => $today->copy()->addDays(30),
                'notes' => 'Awaiting membership activation.',
            ],
            [
                'member_index' => 0,
                'type_index' => 1,
                'status' => 'pending',
                'start_date' => $today->copy(),
                'expiration_date' => $today->copy()->addDays(30),
                'notes' => 'Pending Premium membership.',
            ],
            [
                'member_index' => 1,
                'type_index' => 2,
                'status' => 'expired',
                'start_date' => $today->copy()->subDays(60),
                'expiration_date' => $today->copy()->subDays(30),
                'notes' => 'Expired VIP membership.',
            ],
            [
                'member_index' => 0,
                'type_index' => 0,
                'status' => 'expired',
                'start_date' => $today->copy()->subDays(60),
                'expiration_date' => $today->copy()->subDays(30),
                'notes' => 'Expired Standard membership.',
            ],
            [
                'member_index' => 1,
                'type_index' => 1,
                'status' => 'suspended',
                'start_date' => $today->copy()->subDays(10),
                'expiration_date' => $today->copy()->addDays(20),
                'notes' => 'Suspended for testing.',
            ],
            [
                'member_index' => 0,
                'type_index' => 2,
                'status' => 'cancelled',
                'start_date' => $today->copy()->subDays(10),
                'expiration_date' => $today->copy()->addDays(20),
                'notes' => 'Cancelled for testing.',
            ],
        ];

        foreach ($samples as $sample) {
            $member = $members[$sample['member_index'] % $members->count()];
            $type = $types[$sample['type_index'] % $types->count()];

            $basePrice = (float) $type->price;

            $discountType = $type->discount_type ?? 'none';
            $discountValue = (float) ($type->discount_value ?? 0);

            $discountAmount = match ($discountType) {
                'percentage' => $basePrice * $discountValue / 100,
                'fixed' => min($discountValue, $basePrice),
                default => 0,
            };

            Membership::create([
                'member_id' => $member->id,
                'membership_type_id' => $type->id,
                'start_date' => $sample['start_date']->toDateString(),
                'expiration_date' => $sample['expiration_date']->toDateString(),
                'status' => $sample['status'],
                'base_price' => $basePrice,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'final_price' => max(0, $basePrice - $discountAmount),
                'renewed_from_id' => null,
                'notes' => $sample['notes'],
                'expiration_notification_sent_at' => null,
            ]);
        }

        $this->command->info('9 sample memberships created successfully.');
    }
}