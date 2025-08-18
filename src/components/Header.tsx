import React from 'react';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    return (
        <header className="bg-card shadow-md p-4 flex justify-between items-center border-b border-border h-16">
            <div className="flex items-center">
                <button className="lg:hidden mr-4 text-muted-foreground" onClick={onMenuClick}>
                    <i className="fas fa-bars text-xl"></i>
                </button>
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
