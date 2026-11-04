import { COLOR_CLASSES } from "../enums/enum";

export default function BadgeCard({
    title,
    value,
    description,
    icon: Icon,
    color,
    colorIndex = 0,
}) {
    const COLORS = Object.values(COLOR_CLASSES);
    const selectedColor = color ? COLOR_CLASSES[color.toUpperCase()] || color : COLORS[colorIndex % COLORS.length];

    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-slate-500">{title}</p>
                {Icon && (
                    <span className={`shrink-0 rounded-lg p-2 ${selectedColor}`}>
                        <Icon className="h-5 w-5" />
                    </span>
                )}
            </div>
            <p className="mt-3 break-words text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
            {description && (
                <p className="mt-1 text-xs text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}
