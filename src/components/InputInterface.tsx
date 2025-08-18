import React from 'react';

interface InputInterfaceProps {
    userPrompt: string;
    setUserPrompt: (prompt: string) => void;
    validationWarnings: string[];
}

const InputInterface = ({ userPrompt, setUserPrompt, validationWarnings }: InputInterfaceProps) => {
    return (
        <div className="mb-4 relative">
            <label htmlFor="userPrompt" className="block text-sm font-medium text-foreground mb-2">Clean Input Box Interface</label>
            <textarea
                id="userPrompt"
                className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all h-36"
                placeholder="E.g., An astronaut riding a horse, a function to calculate fibonacci, a sad piano melody..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                aria-label="Describe your core concept"
            ></textarea>
            {validationWarnings.length > 0 && (
                <div className="absolute -bottom-1 translate-y-full left-0 w-full text-xs text-destructive pt-1 space-y-1">
                    {validationWarnings.map((warning, i) => (
                        <p key={i}><i className="fas fa-exclamation-triangle mr-1.5"></i>{warning}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InputInterface;
