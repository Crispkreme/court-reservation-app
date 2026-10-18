
export default function FilterField({ label, children }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
                {label}
            </label>

            {children}
        </div>
    );
}
