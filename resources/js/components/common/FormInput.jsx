import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormInput({
    label,
    id,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    icon: Icon,
    error,
    required = false,
    disabled = false,
    autoComplete,
    className = '',
    ...props
}) {
    const generatedId = useId();
    const inputId = id || name || generatedId;

    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className={`w-full ${className}`}>
            {/* LABEL */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    {label}

                    {required && (
                        <span className="ml-1 text-red-600">*</span>
                    )}
                </label>
            )}

            {/* INPUT WRAPPER */}
            <div className="group relative">

                {/* LEFT ICON */}
                {Icon && (
                    <Icon
                        size={19}
                        aria-hidden="true"
                        className={`
                            pointer-events-none absolute left-4 top-1/2
                            -translate-y-1/2 transition-colors duration-200
                            ${error
                                ? 'text-red-500'
                                : 'text-slate-400 group-focus-within:text-red-600'
                            }
                        `}
                    />
                )}

                {/* INPUT */}
                <input
                    {...props}
                    id={inputId}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={
                        error ? `${inputId}-error` : undefined
                    }
                    className={`
                        w-full rounded-xl border
                        bg-[#FAFAFA] py-3.5
                        text-sm font-medium text-slate-800
                        outline-none transition-all duration-200

                        placeholder:font-normal
                        placeholder:text-slate-400

                        hover:border-slate-300

                        focus:bg-white
                        focus:ring-4

                        disabled:cursor-not-allowed
                        disabled:bg-slate-100
                        disabled:opacity-60

                        ${Icon ? 'pl-12' : 'pl-4'}
                        ${isPassword ? 'pr-12' : 'pr-4'}

                        ${
                            error
                                ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                                : 'border-slate-200 focus:border-red-600 focus:ring-red-100'
                        }
                    `}
                />

                {/* PASSWORD VISIBILITY */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={disabled}
                        aria-label={
                            showPassword
                                ? 'Hide password'
                                : 'Show password'
                        }
                        aria-pressed={showPassword}
                        className="
                            absolute inset-y-0 right-0
                            flex items-center px-4
                            text-slate-400
                            transition-colors duration-200
                            hover:text-red-600
                            focus-visible:outline-none
                            focus-visible:text-red-600
                            disabled:cursor-not-allowed
                        "
                    >
                        {showPassword ? (
                            <EyeOff size={19} />
                        ) : (
                            <Eye size={19} />
                        )}
                    </button>
                )}
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}