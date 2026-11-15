import { useState } from 'react';
import { KeyRound, LockKeyhole, Save } from 'lucide-react';
import FormInput from '../../common/FormInput';
import AlertMessage from '../../AlertMessage';
import { changePassword } from '../../../services/profileService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PasswordSuccessModal from '../../modal/PasswordSuccessModal';

const initialForm = {
    current_password: '',
    password: '',
    password_confirmation: '',
};

export default function ChangePasswordForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ ...initialForm });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const { logout } = useAuth();   

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));

        setMessage('');
    };

    // Submit password update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;

        setSaving(true);
        setErrors({});
        setMessage('');

        try {
            const response = await changePassword(form);

            setMessage(
                response.message ||
                'Password updated successfully.'
            );

            // Clear sensitive fields after success
            setForm({ ...initialForm });

            // Show success modal instead of immediately logging out
            setShowSuccessModal(true);

        } catch (error) {
            const response = error.response;

            if (response?.status === 422) {
                setErrors(response.data?.errors || {});
            } else {
                setErrors({
                    general: [
                        response?.data?.message ||
                        'Unable to update password. Please try again.',
                    ],
                });
            }

        } finally {
            setSaving(false);
        }
    };

    const handleLogoutAndLogin = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await logout();
        } finally {
            navigate('/login', {
                replace: true,
                state: {
                    message:
                        'Your password has been updated. Please sign in with your new password.',
                },
            });
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* SUCCESS MESSAGE */}
                {message && (
                    <AlertMessage
                        message={message}
                        type="success"
                        onClose={() => setMessage('')}
                    />
                )}

                {/* GENERAL ERROR */}
                {errors.general && (
                    <AlertMessage
                        message={errors.general[0]}
                        type="error"
                        onClose={() =>
                            setErrors((prev) => ({
                                ...prev,
                                general: undefined,
                            }))
                        }
                    />
                )}

                {/* CURRENT PASSWORD */}
                <FormInput
                    label="Current Password"
                    name="current_password"
                    type="password"
                    value={form.current_password}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    icon={LockKeyhole}
                    error={errors.current_password?.[0]}
                    autoComplete="current-password"
                    required
                    disabled={saving}
                />

                {/* NEW PASSWORD */}
                <FormInput
                    label="New Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    icon={KeyRound}
                    error={errors.password?.[0]}
                    autoComplete="new-password"
                    required
                    disabled={saving}
                />

                {/* CONFIRM PASSWORD */}
                <FormInput
                    label="Confirm New Password"
                    name="password_confirmation"
                    type="password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    icon={KeyRound}
                    error={errors.password_confirmation?.[0]}
                    autoComplete="new-password"
                    required
                    disabled={saving}
                />

                {/* PASSWORD GUIDELINES */}
                <p className="text-xs leading-relaxed text-[#859489]">
                    Your new password must be at least 8 characters,
                    contain letters and numbers, and be different
                    from your current password.
                </p>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end border-t border-[#EDF1EB] pt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="
                            inline-flex items-center justify-center
                            gap-2 rounded-xl bg-[#176B3A]
                            px-5 py-3 text-sm font-semibold
                            text-white transition
                            hover:bg-[#12582F]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {saving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                            <Save size={17} />
                        )}

                        {saving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>

            </form>

            <PasswordSuccessModal
                open={showSuccessModal}
                onConfirm={handleLogoutAndLogin}
                loading={loggingOut}
            />
        </>
    );
}