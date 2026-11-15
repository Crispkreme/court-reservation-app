export default function TableLoader({
    rows = 5,
    columns = 6,
    variant = "employees",
}) {
    const skeletonClass =
        "animate-pulse rounded-lg bg-red-100";

    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                    key={`skeleton-${rowIndex}`}
                    className="border-b border-gray-100"
                    aria-hidden="true"
                >
                    {Array.from({ length: columns }).map(
                        (_, colIndex) => (
                            <td
                                key={colIndex}
                                className="px-5 py-5"
                            >
                                {variant === "employees" &&
                                colIndex === 0 ? (
                                    /* Employee Avatar + Details */
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`
                                                h-11 w-11 shrink-0
                                                rounded-full
                                                ${skeletonClass}
                                            `}
                                        />

                                        <div className="flex-1 space-y-2">
                                            <div
                                                className={`
                                                    h-3.5 w-28 max-w-full
                                                    ${skeletonClass}
                                                `}
                                            />

                                            <div
                                                className={`
                                                    h-2.5 w-36 max-w-full
                                                    ${skeletonClass}
                                                `}
                                            />
                                        </div>
                                    </div>
                                ) : colIndex === columns - 1 ? (
                                    /* Action Buttons */
                                    <div className="flex justify-end gap-2">
                                        <div
                                            className={`
                                                h-8 w-8
                                                ${skeletonClass}
                                            `}
                                        />

                                        <div
                                            className={`
                                                h-8 w-8
                                                ${skeletonClass}
                                            `}
                                        />
                                    </div>
                                ) : variant === "categories" &&
                                  colIndex === 2 ? (
                                    /* Category Status Badge */
                                    <div
                                        className={`
                                            h-6 w-20 rounded-full
                                            ${skeletonClass}
                                        `}
                                    />
                                ) : (
                                    /* Generic Table Cell */
                                    <div
                                        className={`
                                            h-4 max-w-full
                                            ${skeletonClass}
                                            ${
                                                colIndex === 1
                                                    ? "w-40"
                                                    : colIndex % 2 === 0
                                                    ? "w-20"
                                                    : "w-28"
                                            }
                                        `}
                                    />
                                )}
                            </td>
                        )
                    )}
                </tr>
            ))}
        </>
    );
}
