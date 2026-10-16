<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MembershipType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'description',
        'price',
        'discount_type',
        'discount_value',
        'duration_days',
        'benefits',
        'access_rules',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'duration_days' => 'integer',
        'benefits' => 'array',
        'access_rules' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Memberships using this membership type.
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    /**
     * Calculate the final price after applying the membership discount.
     */
    public function calculateFinalPrice(): float
    {
        $price = (float) $this->price;

        if (!$this->discount_type || !$this->discount_value) {
            return $price;
        }

        if ($this->discount_type === 'percentage') {
            return max(
                0,
                $price - (
                    $price * ((float) $this->discount_value / 100)
                )
            );
        }

        if ($this->discount_type === 'fixed') {
            return max(
                0,
                $price - (float) $this->discount_value
            );
        }

        return $price;
    }

    public function privilege(): HasOne
    {
        return $this->hasOne(
            MembershipPrivilege::class
        );
    }
}