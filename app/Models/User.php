<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_MEMBER = 'member';

    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_MEMBER,
    ];

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_INACTIVE,
    ];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isMember(): bool
    {
        return $this->role === self::ROLE_MEMBER;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isInactive(): bool
    {
        return $this->status === self::STATUS_INACTIVE;
    }

    public function canAccessAdminCalendar(): bool
    {
        return $this->isAdmin() && $this->isActive();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_INACTIVE);
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    public function scopeMembers(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_MEMBER);
    }

    public function scopeWithBookingsBetween(
        Builder $query,
        string $start,
        string $end
    ): Builder {
        return $query->with([
            'bookings' => fn (Builder $bookingQuery) =>
                $bookingQuery
                    ->betweenDates($start, $end)
                    ->orderBy('start_at'),
        ]);
    }
}