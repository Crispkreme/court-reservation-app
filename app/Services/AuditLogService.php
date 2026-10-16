<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogService
{
    public static function record(
        string $module,
        string $action,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?string $reason = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),

            'auditable_type' =>
                $model
                    ? get_class($model)
                    : null,

            'auditable_id' =>
                $model?->getKey(),

            'module' => $module,

            'action' => $action,

            'description' => $description,

            'old_values' => $oldValues,

            'new_values' => $newValues,

            'reason' => $reason,

            'ip_address' =>
                request()->ip(),

            'user_agent' =>
                request()->userAgent(),

            'created_at' => now(),
        ]);
    }

    public static function created(
        string $module,
        Model $model,
        ?array $newValues = null,
        ?string $description = null
    ): AuditLog {
        return self::record(
            $module,
            'created',
            $model,
            null,
            $newValues ?? $model->toArray(),
            $description
        );
    }

    public static function updated(
        string $module,
        Model $model,
        array $oldValues,
        array $newValues,
        ?string $description = null,
        ?string $reason = null
    ): AuditLog {
        return self::record(
            $module,
            'updated',
            $model,
            $oldValues,
            $newValues,
            $description,
            $reason
        );
    }

    public static function deleted(
        string $module,
        Model $model,
        ?array $oldValues = null,
        ?string $description = null,
        ?string $reason = null
    ): AuditLog {
        return self::record(
            $module,
            'deleted',
            $model,
            $oldValues ?? $model->toArray(),
            null,
            $description,
            $reason
        );
    }
}