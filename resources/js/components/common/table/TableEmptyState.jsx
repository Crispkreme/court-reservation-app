
import { Inbox } from "lucide-react";

export default function TableEmptyState({
    colSpan = 1,
    icon: Icon = Inbox,
    title = "No records found",
    description = "There is no data available to display.",
    className = "",
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className={`
                    px-5 py-12 text-center
                    ${className}
                `}
            >
                {/* Empty State Icon */}
                {Icon && (
                    <Icon
                        size={36}
                        aria-hidden="true"
                        className="mx-auto mb-3 text-red-200"
                    />
                )}

                {/* Title */}
                <p className="font-semibold text-gray-700">
                    {title}
                </p>

                {/* Optional Description */}
                {description && (
                    <p className="mt-1 text-sm text-gray-400">
                        {description}
                    </p>
                )}
            </td>
        </tr>
    );
}
