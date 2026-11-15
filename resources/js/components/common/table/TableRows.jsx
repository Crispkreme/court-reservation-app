export default function TableRows({
    data = [],
    columns = [],
    rowKey = "id",
    onRowClick,
    className = "",
}) {
    return (
        <>
            {data.map((item, index) => {
                const key =
                    typeof rowKey === "function"
                        ? rowKey(item)
                        : item[rowKey] ?? index;

                return (
                    <tr
                        key={key}
                        onClick={
                            onRowClick
                                ? () => onRowClick(item)
                                : undefined
                        }
                        className={`
                            transition-colors
                            hover:bg-gray-50
                            ${onRowClick ? "cursor-pointer" : ""}
                            ${className}
                        `}
                    >
                        {columns.map((column, colIndex) => {
                            const value = item[column.key];

                            return (
                                <td
                                    key={column.key ?? colIndex}
                                    className={`
                                        px-5 py-4
                                        text-sm text-gray-600
                                        ${
                                            column.align === "right"
                                                ? "text-right"
                                                : column.align === "center"
                                                ? "text-center"
                                                : "text-left"
                                        }
                                        ${column.className || ""}
                                    `}
                                >
                                    {column.render
                                        ? column.render(
                                              value,
                                              item,
                                              index
                                          )
                                        : value ?? "—"}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </>
    );
}
