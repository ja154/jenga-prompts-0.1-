import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="app-layout">
            <Header />
            <Sidebar />
            <MainContent>
                {children}
            </MainContent>
        </div>
    );
};

export default Layout;
