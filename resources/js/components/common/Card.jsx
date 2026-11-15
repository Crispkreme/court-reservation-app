
import React from 'react';

export default function SettingsCard({
    children,
    className = '',
    padding = true,
    ...props
}) {
    return (
        <section
            className={`
                rounded-2xl border border-[#E2EBDF]
                bg-white shadow-sm
                ${padding ? 'p-6 sm:p-8' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </section>
    );
}
