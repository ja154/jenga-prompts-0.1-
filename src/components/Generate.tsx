import React from 'react';

interface GenerateProps {
    isLoading: boolean;
    userPrompt: string;
    handleGenerateClick: () => void;
}

const Generate = ({ isLoading, userPrompt, handleGenerateClick }: GenerateProps) => {
    const buttonText = isLoading ? 'Working...' : 'Generate Prompt';

    return (
        <div className="flex items-center justify-between">
            <button
                onClick={handleGenerateClick}
                disabled={isLoading || !userPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] glow flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-live="polite"
            >
                {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
                {buttonText}
            </button>
            <button className="ml-4 bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-gray-600 transition-all">
                Advanced
            </button>
        </div>
    );
};

export default Generate;
