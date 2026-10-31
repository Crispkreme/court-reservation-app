export default function TableHead({
    columns = [],
}) {
    return (
        <thead className="bg-slate-50">
            <tr>
                {columns.map((column, index) => {
                    const heading =
                        typeof column === "string"
                            ? column
                            : column.label;

                    return (
                        <th
                            key={column.key ?? heading ?? index}
                            className={`whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                                column.align === "right"
                                    ? "text-right"
                                    : column.align === "center"
                                    ? "text-center"
                                    : "text-left"
                            }`}
                        >
                            {heading}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
