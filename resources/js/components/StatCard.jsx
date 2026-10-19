
import {
    Users,
    UserCheck,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';

const iconMap = {
    total: Users,
    active: UserCheck,
    pending: Clock,
    expired: AlertCircle,
    suspended: XCircle,
    cancelled: XCircle,
    expiring: Clock,
};

const accentMap = {
    total: 'bg-blue-50 text-blue-700 ring-blue-100',
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    pending: 'bg-amber-50 text-amber-700 ring-amber-100',
    expired: 'bg-red-50 text-red-700 ring-red-100',
    suspended: 'bg-slate-100 text-slate-700 ring-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-100',
    expiring: 'bg-violet-50 text-violet-700 ring-violet-100',
};

export default function StatCard({
    label,
    value = 0,
    type = 'total',
    description,
}) {
    const Icon = iconMap[type] ?? Users;
    const accent =
        accentMap[type] ?? accentMap.total;

    return (
        <div className="group relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 opacity-80" />

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value ?? 0}
                    </p>

                    {description && (
                        <p className="mt-2 text-xs text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${accent}`}
                >
                    <Icon size={21} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}
