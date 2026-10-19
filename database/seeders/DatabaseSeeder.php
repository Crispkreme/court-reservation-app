<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([ 
            UserSeeder::class, 
            SportCategorySeeder::class, 
            CourtSeeder::class, 
            CourtPricingSeeder::class, 
            CourtMaintenancePeriodSeeder::class, 

            CourtScheduleSeeder::class,
            CourtScheduleOverrideSeeder::class,

            BookingSeeder::class,
            BookingHoldSeeder::class,
            BookingStatusHistorySeeder::class,

            MembershipTierSeeder::class,
            BookingRuleSeeder::class,
            CancellationPolicySeeder::class,

            MemberSeeder::class,
            MembershipTypeSeeder::class,
            MembershipPrivilegeSeeder::class,
            MembershipSeeder::class,
            MatchmakingSeeder::class,

            PaymentSeeder::class,
            TransactionSeeder::class,
            OutstandingPaymentSeeder::class,
            OperationalControlSeeder::class,
            ReservationNotificationSeeder::class,
            CustomerDashboardSeeder::class,
            AdminDashboardSeeder::class,
            FailureExceptionSeeder::class,
            AuditLogSeeder::class,
        ]);
    }
}
