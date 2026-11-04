export default function Header({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    actionIcon: ActionIcon,
    children,
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon size={24} />
                    </div>
                )}

                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {(actionLabel && onAction) || children ? (
                <div className="flex shrink-0 items-center gap-2">
                    {children}

                    {actionLabel && onAction && (
                        <button
                            type="button"
                            onClick={onAction}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {ActionIcon && <ActionIcon size={18} />}
                            {actionLabel}
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    );
}