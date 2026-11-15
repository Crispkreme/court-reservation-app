
import React, { useId } from 'react';

export default function ToggleSetting({
    id,
    label,
    description,
    checked = false,
    onChange,
    disabled = false,
    className = '',
}) {
    const generatedId = useId();
    const switchId = id || generatedId;

    const handleToggle = () => {
        if (disabled) return;

        onChange?.(!checked);
    };

    return (
        <div
            className={`
                flex items-center justify-between gap-4 py-3
                ${disabled ? 'opacity-60' : ''}
                ${className}
            `}
        >
            {/* LABEL & DESCRIPTION */}
            <div className="min-w-0 flex-1">
                <label
                    htmlFor={switchId}
                    className="block cursor-pointer text-sm font-semibold text-[#294634]"
                >
                    {label}
                </label>

                {description && (
                    <p
                        id={`${switchId}-description`}
                        className="mt-1 text-xs leading-relaxed text-[#859489]"
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* TOGGLE SWITCH */}
            <button
                id={switchId}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-describedby={
                    description
                        ? `${switchId}-description`
                        : undefined
                }
                aria-label={label}
                disabled={disabled}
                onClick={handleToggle}
                className={`
                    relative h-7 w-12 shrink-0 rounded-full
                    transition-colors duration-200
                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-[#DFF1DE]
                    disabled:cursor-not-allowed
                    ${
                        checked
                            ? 'bg-[#176B3A]'
                            : 'bg-gray-300'
                    }
                `}
            >
                {/* SWITCH INDICATOR */}
                <span
                    className={`
                        absolute left-1 top-1 h-5 w-5
                        rounded-full bg-white shadow-sm
                        transition-transform duration-200
                        ${
                            checked
                                ? 'translate-x-5'
                                : 'translate-x-0'
                        }
                    `}
                />
            </button>
        </div>
    );
}
