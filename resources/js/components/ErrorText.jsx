
export default function ErrorText({ error }) {
    if (!error) return null;

    const message = Array.isArray(error) ? error[0] : error;

    return (
        <p className="mt-1.5 text-xs text-rose-600">
            {message}
        </p>
    );
}
