import React from 'react';

const Header = () => {
    return (
        <header className="app-header bg-card shadow-md p-4 flex justify-between items-center border-b border-border h-16">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-md mr-3"></div>
                <h1 className="text-xl font-bold text-foreground tracking-wider">JENGAPROMPTS</h1>
            </div>
            <div className="flex items-center space-x-4">
                {/* Placeholder for future icons like notifications or user menu */}
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-8 h-8 bg-muted rounded-full"></div>
            </div>
        </header>
    );
};

export default Header;
