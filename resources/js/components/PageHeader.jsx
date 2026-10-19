
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({
    title,
    description,
    count,
    countLabel = 'total',
    showHomeButton = true,
    onHomeClick,
    children,
}) {
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (onHomeClick) {
            onHomeClick();
        } else {
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {count !== undefined && count !== null && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        {count}{' '}
                        {countLabel}
                    </div>
                )}

                {children}

                {showHomeButton && (
                    <button
                        type="button"
                        onClick={handleGoHome}
                        title="Go to Dashboard"
                        aria-label="Go to Dashboard"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                        <Home size={20} strokeWidth={1.8} />
                    </button>
                )}
            </div>
        </div>
    );
}
