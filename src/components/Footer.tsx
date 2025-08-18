import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
            <div className="flex justify-center space-x-4 mb-2">
                <div className="w-6 h-6 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-6 h-6 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
                <div className="w-6 h-6 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <p>© 2024 JengaPrompts.</p>
        </footer>
    );
};

export default Footer;
