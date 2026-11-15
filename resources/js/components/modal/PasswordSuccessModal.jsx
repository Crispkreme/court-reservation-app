
import { CheckCircle2, LogOut, ShieldCheck } from 'lucide-react';

export default function PasswordSuccessModal({
    open,
    onConfirm,
    loading = false,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 py-6">

            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="password-success-title"
                aria-describedby="password-success-description"
                className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl"
            >
                {/* SUCCESS ICON */}
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF6EA]">
                    <CheckCircle2
                        size={42}
                        className="text-[#176B3A]"
                    />
                </div>

                {/* TITLE */}
                <h2
                    id="password-success-title"
                    className="text-xl font-bold text-[#153D29]"
                >
                    Password Updated Successfully!
                </h2>

                {/* DESCRIPTION */}
                <p
                    id="password-success-description"
                    className="mt-3 text-sm leading-relaxed text-[#64806B]"
                >
                    Your account password has been changed successfully.
                    For security reasons, you need to log out and sign in
                    again using your new password.
                </p>

                {/* SECURITY NOTICE */}
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#DCE7DA] bg-[#F4F8F2] p-4 text-left">
                    <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-[#176B3A]"
                    />

                    <p className="text-xs leading-relaxed text-[#526A58]">
                        Please remember your new password. Your current
                        session will end when you continue.
                    </p>
                </div>

                {/* CONFIRM BUTTON */}
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12582F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                        <LogOut size={18} />
                    )}

                    {loading
                        ? 'Logging out...'
                        : 'Logout & Login Again'}
                </button>
            </div>
        </div>
    );
}
