
import { useEffect } from "react";
import { X, RefreshCw } from "lucide-react";

export default function SportCategoryModal({
    isOpen,
    onClose,
    editingCategory,
    form,
    setForm,
    handleSubmit,
    formError,
    saving,
}) {
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape" && !saving) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, saving, onClose]);

    if (!isOpen) return null;

    const inputClass =
        "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {editingCategory
                                ? "Edit Sport Category"
                                : "Add Sport Category"}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Enter the sport category details below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-5">

                        {/* Error */}
                        {formError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                {formError}
                            </div>
                        )}

                        {/* Category Name */}
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                Sport Category Name
                            </span>

                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="e.g. Basketball"
                                required
                                className={inputClass}
                            />
                        </label>

                        {/* Description */}
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                Description
                            </span>

                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Enter a short description..."
                                className={`${inputClass} resize-none`}
                            />
                        </label>

                        {/* Status */}
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                Status
                            </span>

                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm((previous) => ({
                                        ...previous,
                                        status: e.target.value,
                                    }))
                                }
                                className={`${inputClass} bg-white`}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && (
                                <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                />
                            )}

                            {saving
                                ? "Saving..."
                                : editingCategory
                                ? "Update Category"
                                : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
