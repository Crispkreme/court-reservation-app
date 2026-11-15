
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function DocumentCard({
    title,
    description,
    icon: Icon,
    onClick,
    disabled = false,
}) {
    const Tag = disabled ? 'div' : 'button';

    return (
        <Tag
            {...(!disabled
                ? { type: 'button', onClick }
                : {})}
            className={`
                group relative flex h-full w-full
                flex-col items-start rounded-2xl
                border border-[#E2EBDF] bg-white
                p-6 text-left shadow-sm
                transition-all duration-200
                ${
                    disabled
                        ? 'cursor-default opacity-70'
                        : 'cursor-pointer hover:-translate-y-1 hover:border-[#176B3A] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B3A]'
                }
            `}
        >
            {/* ICON AND ARROW */}
            <div className="mb-5 flex w-full items-start justify-between">
                <div
                    className="
                        flex h-14 w-14 items-center
                        justify-center rounded-xl
                        bg-[#EDF6EA] text-[#176B3A]
                        transition-colors
                        group-hover:bg-[#DCEED7]
                    "
                >
                    {Icon && <Icon size={26} strokeWidth={1.8} />}
                </div>

                {!disabled && (
                    <ArrowUpRight
                        size={19}
                        className="
                            text-[#93A79A] transition-colors
                            group-hover:text-[#176B3A]
                        "
                    />
                )}
            </div>

            {/* TITLE */}
            <h3 className="text-base font-bold text-[#153D29]">
                {title}
            </h3>

            {/* DESCRIPTION */}
            <p className="mt-2 text-sm leading-relaxed text-[#718C78]">
                {description}
            </p>
        </Tag>
    );
}
