
export default function TableHeader({
    columns = [],
    className = "",
}) {
    return (
        <thead
            className={`
                bg-gray-50
                text-xs uppercase tracking-wide
                text-gray-500
                ${className}
            `}
        >
            <tr>
                {columns.map((column, index) => {
                    const item =
                        typeof column === "string"
                            ? {
                                  label: column,
                                  key: column,
                              }
                            : column;

                    const alignment =
                        item.align === "right"
                            ? "text-right"
                            : item.align === "center"
                            ? "text-center"
                            : "text-left";

                    return (
                        <th
                            key={item.key ?? index}
                            scope="col"
                            className={`
                                px-5 py-4
                                font-semibold
                                whitespace-nowrap
                                ${alignment}
                                ${item.className || ""}
                            `}
                        >
                            {item.label}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
