
export default function InfoPanel({ title, children }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold">
                {title}
            </h3>

            <div className="mt-3">
                {children}
            </div>
        </div>
    );
}
