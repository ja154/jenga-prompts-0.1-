import React from 'react';

const MainContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto container mx-auto">
            {children}
        </main>
    );
};

export default MainContent;
