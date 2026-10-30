
export default function Section({
    icon: Icon,
    title,
    description,
    children,
    columns = 2,
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
                {Icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon size={20} />
                    </div>
                )}

                <div>
                    <h2 className="font-semibold text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div
                className="grid grid-cols-1 gap-5 p-5 sm:p-6"
                style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
            >
                {children}
            </div>
        </section>
    );
}
