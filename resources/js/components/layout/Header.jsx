
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, CircleUserRound, ChevronDown, UserRound, LogOut } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function Header({
    title = 'Dashboard',
    user,
    onMenuClick,
}) {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const role = user?.role?.toLowerCase();
    const basePath = role === 'admin' ? '/admin' : role === 'member' ? '/member' : '';

    const [profileOpen, setProfileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await logout();

            navigate('/login', {
                replace: true,
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    const handleProfile = () => {
        setProfileOpen(false);
        navigate(`${basePath}/account`);
    };

    return (
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-[#E2EBDF] bg-white px-4 sm:px-6 lg:px-8">

            <div className="flex min-w-0 items-center gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                    aria-controls="portal-sidebar"
                    className="rounded-lg p-2 text-[#176B3A] transition hover:bg-[#EDF5EB] lg:hidden"
                >
                    <Menu size={24} />
                </button>

                <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-[#153D29] sm:text-xl">
                        {title}
                    </h2>

                    <p className="hidden text-xs text-[#87988A] sm:block">
                        Company Management Portal
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">

                <div
                    title="Notifications coming soon"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[#52705B]"
                >
                    <Bell size={21} />
                </div>

                <div className="hidden h-8 w-px bg-[#E2EBDF] sm:block" />

                <div className="relative" ref={dropdownRef}>

                    <button
                        type="button"
                        onClick={() => setProfileOpen((prev) => !prev)}
                        aria-expanded={profileOpen}
                        aria-haspopup="menu"
                        aria-label="Open profile menu"
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#F0F7EE]"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CDE5C9] bg-[#E4F2E1] text-[#176B3A]">
                            <CircleUserRound size={24} />
                        </div>

                        <div className="hidden min-w-0 text-left sm:block">
                            <p className="max-w-36 truncate text-sm font-semibold text-[#254A32]">
                                {user?.name || 'Portal User'}
                            </p>

                            <p className="text-xs capitalize text-[#8A9C8F]">
                                {user?.role || 'Employee'}
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className={`hidden text-[#789A7E] transition-transform sm:block ${
                                profileOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#E2EBDF] bg-white shadow-[0_15px_40px_rgba(18,75,38,0.15)]">
                            <div className="border-b border-[#E7EEE4] bg-[#F7FBF5] px-4 py-4">
                                <p className="truncate text-sm font-bold text-[#153D29]">
                                    {user?.name || 'Portal User'}
                                </p>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                    {user?.email || 'No email available'}
                                </p>

                                <span className="mt-3 inline-block rounded-full bg-[#E4F2E1] px-3 py-1 text-[11px] font-semibold capitalize text-[#176B3A]">
                                    {user?.role || 'Employee'}
                                </span>
                            </div>

                            <div className="p-2">

                                <button
                                    type="button"
                                    onClick={handleProfile}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#294634] transition hover:bg-[#EDF6EA]"
                                >
                                    <UserRound
                                        size={19}
                                        className="text-[#176B3A]"
                                    />
                                    My Profile
                                </button>

                                <div className="my-2 border-t border-[#E7EEE4]" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <LogOut size={19} />

                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
