
import React, { useEffect, useRef, useState } from "react";

export default function A4Paper({
    children,
    className = "",
    padding = "15mm",
    showShadow = true,
}) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    const PAPER_WIDTH = 794; // A4 at approximately 96 DPI
    const PAPER_HEIGHT = 1123;

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const updateScale = () => {
            const availableWidth = container.clientWidth;

            setScale(Math.min(1, availableWidth / PAPER_WIDTH));
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);
        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full min-w-0 overflow-hidden print:overflow-visible"
        >
            <div
                className="relative mx-auto print:!h-auto print:!w-full"
                style={{
                    width: PAPER_WIDTH * scale,
                    height: PAPER_HEIGHT * scale,
                }}
            >
                <div
                    className={`
                        a4-paper
                        origin-top-left
                        bg-white
                        ${showShadow ? "shadow-xl" : ""}
                        print:!shadow-none
                        ${className}
                    `}
                    style={{
                        width: `${PAPER_WIDTH}px`,
                        minHeight: `${PAPER_HEIGHT}px`,
                        padding,
                        transform: `scale(${scale})`,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}