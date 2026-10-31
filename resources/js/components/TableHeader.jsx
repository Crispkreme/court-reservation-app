
export default function TableHeader({
    title,
    description,
    count,
    countLabel = "Records",
}) {
    return (
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
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

            {count !== undefined && count !== null && (
                <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {count} {countLabel}
                </span>
            )}
        </div>
    );
}