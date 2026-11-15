
import { Trophy, Pencil, Trash2 } from "lucide-react";

export const sportCategoryColumns = ({
    onToggleStatus,
    onEdit,
    onDelete,
}) => [
    {
        key: "name",
        label: "Sport",
        render: (value) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                    <Trophy size={20} />
                </div>

                <span className="font-semibold text-gray-900">
                    {value}
                </span>
            </div>
        ),
    },
    {
        key: "description",
        label: "Description",
        className: "max-w-xs",
        render: (value) => (
            <span className="text-gray-500">
                {value || "—"}
            </span>
        ),
    },
    {
        key: "status",
        label: "Status",
        render: (value, category) => (
            <button
                type="button"
                onClick={() => onToggleStatus(category)}
                title="Click to change status"
                className={`
                    rounded-full px-3 py-1
                    text-xs font-semibold transition-colors
                    ${
                        value === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                    }
                `}
            >
                {value === "active" ? "Active" : "Inactive"}
            </button>
        ),
    },
    {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (_, category) => (
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                >
                    <Pencil size={17} />
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(category)}
                    aria-label={`Delete ${category.name}`}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                >
                    <Trash2 size={17} />
                </button>
            </div>
        ),
    },
];
