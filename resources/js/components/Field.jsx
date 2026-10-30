
export default function Field({
    label,
    required = false,
    children,
    className = "",
    htmlFor,
}) {
    return (
        <div className={className}>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
                {required && (
                    <span className="ml-1 text-rose-500">*</span>
                )}
            </label>

            {children}
        </div>
    );
}
