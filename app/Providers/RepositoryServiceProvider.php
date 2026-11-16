<?php

namespace App\Providers;

use App\Interfaces\UserRepositoryInterface;
use App\Interfaces\SportCategoryRepositoryInterface;
use App\Interfaces\CourtRepositoryInterface;
use App\Interfaces\CourtMaintenancePeriodInterface;
use App\Interfaces\CourtUtilizationInterface;
use App\Interfaces\CourtScheduleInterface;
use App\Interfaces\CourtRecurringScheduleInterface;
use App\Interfaces\CourtScheduleOverrideInterface;
use App\Interfaces\BookingInterface;
use App\Interfaces\CourtAvailabilityInterface;

use App\Repositories\CourtAvailabilityRepository;
use App\Repositories\BookingRepository;
use App\Repositories\CourtScheduleOverrideRepository;
use App\Repositories\CourtRecurringScheduleRepository;
use App\Repositories\CourtScheduleRepository;
use App\Repositories\CourtUtilizationRepository;
use App\Repositories\CourtMaintenancePeriodRepository;
use App\Repositories\CourtRepository;
use App\Repositories\SportCategoryRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    protected array $repositories = [
        UserRepositoryInterface::class  => UserRepository::class,
        SportCategoryRepositoryInterface::class => SportCategoryRepository::class,
        CourtMaintenancePeriodInterface::class => CourtMaintenancePeriodRepository::class,
        CourtRepositoryInterface::class => CourtRepository::class,
        CourtUtilizationInterface::class => CourtUtilizationRepository::class,
        CourtScheduleInterface::class => CourtScheduleRepository::class,
        CourtRecurringScheduleInterface::class => CourtRecurringScheduleRepository::class,
        CourtScheduleOverrideInterface::class => CourtScheduleOverrideRepository::class,
        BookingInterface::class => BookingRepository::class,
        CourtAvailabilityInterface::class => CourtAvailabilityRepository::class,
    ];
    
    /**
     * Register services.
     */
    public function register(): void
    {
        foreach ($this->repositories as $interface => $repository) {
            $this->app->bind($interface, $repository);
        }        
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
