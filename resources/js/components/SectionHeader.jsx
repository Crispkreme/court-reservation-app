
export default function SectionHeader({
    title,
    subtitle = "Track your court reservations at a glance.",
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-5">
            <div className="h-10 w-1.5 rounded-full bg-emerald-500" />

            <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
