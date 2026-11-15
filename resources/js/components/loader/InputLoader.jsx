
import React from 'react';

export default function InputLoader({
    loading = false,
    children,
    className = '',
    showIcon = false,
    showLabel = true,
    height = 'h-[50px]',
    skeleton = null,
}) {
    if (!loading) {
        return (
            <div className={`w-full ${className}`}>
                {children}
            </div>
        );
    }

    if (skeleton) {
        return (
            <div
                className={`w-full animate-pulse ${className}`}
                role="status"
                aria-label="Loading content"
            >
                {skeleton}
            </div>
        );
    }

    return (
        <div
            className={`w-full animate-pulse ${className}`}
            role="status"
            aria-label="Loading input field"
        >
            {showLabel && (
                <div className="mb-2 h-4 w-28 rounded-md bg-[#E2EBDF]" />
            )}

            <div
                className={`
                    flex w-full items-center
                    rounded-xl border border-[#DCE7DA]
                    bg-[#FAFCF9] px-4
                    ${height}
                `}
            >
                {showIcon && (
                    <div className="mr-4 h-5 w-5 shrink-0 rounded-md bg-[#E2EBDF]" />
                )}

                <div className="h-3 w-2/5 rounded-md bg-[#E2EBDF]" />
            </div>
        </div>
    );
}
