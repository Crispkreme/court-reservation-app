
export default function StatBox({ label, value }) {
    return (
        <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold">
                {value}
            </p>
        </div>
    );
}
