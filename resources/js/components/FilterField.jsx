
export default function FilterField({ label, children }) {
    return (
        <div className="w-full min-w-0 p-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                {label}
            </label>

            {children}
        </div>
    );
}
