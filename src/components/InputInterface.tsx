import React from 'react';

interface InputInterfaceProps {
    userPrompt: string;
    setUserPrompt: (prompt: string) => void;
    validationWarnings: string[];
}

const InputInterface = ({ userPrompt, setUserPrompt, validationWarnings }: InputInterfaceProps) => {
    return (
        <div className="mb-4 relative">
            <label htmlFor="userPrompt" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Clean Input Box Interface</label>
            <textarea
                id="userPrompt"
                className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-36"
                placeholder="E.g., An astronaut riding a horse, a function to calculate fibonacci, a sad piano melody..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                aria-label="Describe your core concept"
            ></textarea>
            {validationWarnings.length > 0 && (
                <div className="absolute -bottom-1 translate-y-full left-0 w-full text-xs text-amber-600 dark:text-amber-400 pt-1 space-y-1">
                    {validationWarnings.map((warning, i) => (
                        <p key={i}><i className="fas fa-exclamation-triangle mr-1.5"></i>{warning}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InputInterface;
