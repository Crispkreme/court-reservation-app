
import React, { useId } from 'react';

export default function FormTextarea({
    label,
    id,
    name,
    value,
    onChange,
    placeholder = '',
    rows = 3,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    className = '',
    ...props
}) {
    const generatedId = useId();
    const textareaId = id || name || generatedId;

    return (
        <div className={`w-full ${className}`}>

            {/* LABEL */}
            {label && (
                <label
                    htmlFor={textareaId}
                    className="mb-2 block text-sm font-semibold text-[#294634]"
                >
                    {label}

                    {required && (
                        <span className="ml-1 text-red-500">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* TEXTAREA */}
            <textarea
                {...props}
                id={textareaId}
                name={name}
                rows={rows}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                    error ? `${textareaId}-error` : undefined
                }
                className={`
                    w-full rounded-xl border
                    bg-[#FAFCF9] px-4 py-3.5
                    text-sm text-[#173D2A]
                    outline-none transition
                    placeholder:text-gray-400
                    focus:ring-4
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                    disabled:opacity-60
                    read-only:cursor-default
                    ${
                        error
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                            : 'border-[#DCE7DA] focus:border-[#20854C] focus:ring-[#DFF1DE]'
                    }
                `}
            />

            {/* VALIDATION ERROR */}
            {error && (
                <p
                    id={`${textareaId}-error`}
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                >
                    {error}
                </p>
            )}

        </div>
    );
}
