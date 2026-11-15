
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({
    title = 'Dashboard',
    menuItems = [],
    children,
}) {

    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    const basePath =
        role === 'admin'
            ? '/admin'
            : role === 'member'
              ? '/member'
              : '';

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-[#F7FAF5]">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                basePath={basePath}
                menuItems={menuItems}
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-64">

                <Header
                    title={title}
                    user={user}
                    basePath={basePath}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="min-h-0 flex-1 overflow-y-auto">
                    {children || <Outlet />}
                </main>

                <Footer />

            </div>
        </div>
    );
}
