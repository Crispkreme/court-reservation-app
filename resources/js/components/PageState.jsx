
import React from "react";
import Layout from "./layout/Layout";

export default function PageState({
    title = "Page",
    loading = false,
    error = "",
    loadingMessage = "Loading...",
    onRetry,
    children
}) {

    // Loading state
    if (loading) {
        return (
            <Layout title={title}>
                <div className="mx-auto w-full max-w-[1800px] space-y-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="rounded-xl bg-white p-8 shadow">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                <p className="text-slate-600">{loadingMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout title={title}>
                <div className="mx-auto w-full max-w-[1800px] space-y-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                            <h2 className="text-lg font-semibold">{title} Error </h2>
                            <p className="mt-2">{error}</p>
                            {onRetry && (
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Normal page content
    return children;
}
