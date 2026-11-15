import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

import AlertMessage from "@components/AlertMessage";
import FormInput from "@components/common/FormInput";
import FormTextarea from "@components/common/FormTextarea";
import FormSelect from "@components/common/FormSelect";

import {
    createSportCategory,
    updateSportCategory,
} from "@services/sportCategoryService";

const initialForm = {
    name: "",
    description: "",
    status: "active",
};

const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

export default function SportCategoryModal({
    isOpen,
    category = null,
    onClose,
    onSuccess,
}) {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const isEditing = Boolean(category);

    // Initialize form when modal opens
    useEffect(() => {
        if (!isOpen) return;

        setForm({
            name: category?.name ?? "",
            description: category?.description ?? "",
            status: category?.status ?? "active",
        });

        setError("");
    }, [isOpen, category]);

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Close modal
    const handleClose = () => {
        if (saving) return;

        setError("");
        onClose();
    };

    // Submit create or edit
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        if (!form.name.trim()) {
            setError("Sport category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                status: form.status,
            };

            if (isEditing) {
                await updateSportCategory(category.id, payload);
            } else {
                await createSportCategory(payload);
            }

            onClose();

            await onSuccess?.(
                isEditing
                    ? "Sport category updated successfully."
                    : "Sport category created successfully."
            );
        } catch (err) {
            const validation = err.response?.data?.errors;

            const firstError = validation
                ? Object.values(validation).flat()[0]
                : null;

            setError(
                firstError ||
                    err.response?.data?.message ||
                    "Unable to save sport category."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="sport-category-modal-title"
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <h2
                        id="sport-category-modal-title"
                        className="text-lg font-bold text-gray-900"
                    >
                        {isEditing
                            ? "Edit Sport Category"
                            : "Add Sport Category"}
                    </h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Close dialog"
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="max-h-[75vh] space-y-5 overflow-y-auto p-6"
                >
                    <AlertMessage
                        type="error"
                        message={error}
                        onClose={() => setError("")}
                    />

                    <FormInput
                        id="category-name"
                        name="name"
                        label="Sport Name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Basketball"
                        maxLength={100}
                        required
                        disabled={saving}
                    />

                    <FormTextarea
                        id="category-description"
                        name="description"
                        label="Description"
                        rows={3}
                        maxLength={1000}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Short description of the sport..."
                        disabled={saving}
                    />

                    <FormSelect
                        id="category-status"
                        name="status"
                        label="Status"
                        value={form.status}
                        onChange={handleChange}
                        options={statusOptions}
                        placeholder=""
                        required
                        disabled={saving}
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {saving && (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {saving
                                ? "Saving..."
                                : isEditing
                                ? "Save Changes"
                                : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
