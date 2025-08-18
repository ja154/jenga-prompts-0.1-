import React from 'react';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 h-16">
            <div className="flex items-center">
                <button className="lg:hidden mr-4 text-slate-500 dark:text-slate-400" onClick={onMenuClick}>
                    <i className="fas fa-bars text-xl"></i>
                </button>
                <div className="w-8 h-8 bg-purple-500 rounded-md mr-3"></div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-wider">JENGAPROMPTS</h1>
            </div>
            <div className="flex items-center space-x-4">
                {/* Placeholder for future icons like notifications or user menu */}
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
        </header>
    );
};

export default Header;
