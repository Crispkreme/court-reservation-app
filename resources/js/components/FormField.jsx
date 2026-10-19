
export default function FormField({
    label,
    required = false,
    error,
    htmlFor,
    children,
    className = '',
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="block text-sm font-medium text-slate-700"
                >
                    {label}

                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
            )}

            {children}

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
