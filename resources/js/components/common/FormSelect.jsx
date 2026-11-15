import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FormSelect({
    label,
    id,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    icon: Icon,
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    const generatedId = useId();
    const selectId = id || name || generatedId;

    // Animation state
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`w-full ${className}`}>

            {/* Label */}
            {label && (
                <label
                    htmlFor={selectId}
                    className="mb-2 block text-sm font-semibold text-[#294634]"
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
            )}

            <div className="relative">

                {/* Optional Left Icon */}
                {Icon && (
                    <Icon
                        size={19}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#789A7E]"
                    />
                )}

                {/* Select */}
                <select
                    {...props}
                    id={selectId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={
                        error ? `${selectId}-error` : undefined
                    }
                    className={`
                        w-full appearance-none rounded-xl
                        border bg-[#FAFCF9]
                        py-3.5 pr-12
                        text-sm text-[#173D2A]
                        outline-none transition
                        focus:ring-4
                        disabled:cursor-not-allowed
                        disabled:bg-gray-100
                        disabled:opacity-60
                        ${Icon ? 'pl-12' : 'pl-4'}
                        ${
                            error
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                : 'border-[#DCE7DA] focus:border-[#20854C] focus:ring-[#DFF1DE]'
                        }
                    `}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {options.map((option) => {
                        const item =
                            typeof option === 'string'
                                ? {
                                    label: option,
                                    value: option,
                                }
                                : option;

                        return (
                            <option
                                key={item.value}
                                value={item.value}
                                disabled={item.disabled ?? false}
                            >
                                {item.label}
                            </option>
                        );
                    })}
                </select>

                {/* Animated Chevron Container */}
                <div
                    className="
                        pointer-events-none absolute
                        right-5 top-1/2 -translate-y-1/2
                        flex items-center justify-center
                    "
                >
                    <ChevronDown
                        size={19}
                        aria-hidden="true"
                        className={`
                            text-[#789A7E]
                            transform-gpu
                            transition-transform
                            duration-300
                            ease-in-out
                            motion-reduce:transition-none
                            ${isFocused ? 'rotate-180' : 'rotate-0'}
                        `}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p
                    id={`${selectId}-error`}
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
