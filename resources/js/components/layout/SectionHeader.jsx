
import React from 'react';

export default function SectionHeader({
    icon: Icon,
    title,
    description,
    className = '',
    children,
}) {
    return (
        <div
            className={`
                mb-6 flex items-center gap-3
                border-b border-[#EDF1EB] pb-5
                ${className}
            `}
        >
            {/* SECTION ICON */}
            {Icon && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF6EA] text-[#176B3A]">
                    <Icon size={21} />
                </div>
            )}

            {/* SECTION INFORMATION */}
            <div className="min-w-0 flex-1">
                {title && (
                    <h3 className="text-lg font-bold text-[#153D29]">
                        {title}
                    </h3>
                )}

                {description && (
                    <p className="mt-1 text-sm text-[#859489]">
                        {description}
                    </p>
                )}
            </div>

            {/* OPTIONAL RIGHT-SIDE CONTENT */}
            {children && (
                <div className="shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
}
