import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 flex lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <Sidebar />
                <div className="flex-shrink-0 w-14" onClick={() => setIsSidebarOpen(false)} aria-hidden="true"></div>
            </div>

            <div className="flex flex-col flex-1">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <MainContent>
                    {children}
                </MainContent>
            </div>
        </div>
    );
};

export default Layout;
