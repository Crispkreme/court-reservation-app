<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipExpirationNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'membership_id',
        'member_id',
        'days_before_expiration',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}