import React from 'react';

const ThemeToggle = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50" aria-label="Toggle theme">
        <button onClick={toggleTheme} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            {theme === 'light' ? (
                <i className="fas fa-moon text-muted-foreground"></i>
            ) : (
                <i className="fas fa-sun text-muted-foreground"></i>
            )}
        </button>
    </div>
);

export default ThemeToggle;
