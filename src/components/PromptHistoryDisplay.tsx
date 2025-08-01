import React from 'react';
import { PromptHistoryItem, PromptMode } from '../types';

interface PromptHistoryDisplayProps {
    history: PromptHistoryItem[];
    onReuse: (item: PromptHistoryItem) => void;
    onDelete: (id: number) => void;
    onClear: () => void;
}

const PromptHistoryDisplay = ({ history, onReuse, onDelete, onClear }: PromptHistoryDisplayProps) => {
    if (history.length === 0) {
        return null; // Don't render the section if there's no history
    }

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear your entire prompt history? This action cannot be undone.')) {
            onClear();
        }
    };
    
    const getModeIcon = (mode: PromptMode) => {
        const icons = {
            [PromptMode.Text]: 'fa-file-alt',
            [PromptMode.Image]: 'fa-image',
            [PromptMode.Video]: 'fa-video',
            [PromptMode.Audio]: 'fa-music',
            [PromptMode.Code]: 'fa-code',
        };
        return icons[mode] || 'fa-question-circle';
    }

    return (
        <section className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12 fade-in" style={{ animationDelay: '0.8s' }} aria-labelledby="history-heading">
            <div className="flex items-center justify-between mb-6">
                <h2 id="history-heading" className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-3">
                    <i className="fas fa-history"></i>
                    Prompt History
                </h2>
                <button
                    onClick={handleClear}
                    className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-500 dark:text-red-400 font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
                    aria-label="Clear all history"
                >
                    <i className="fas fa-trash"></i>
                    Clear History
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-2">
                {history.map((item: PromptHistoryItem) => (
                    <div key={item.id} className="bg-slate-100 dark:bg-gray-800/50 p-4 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-gray-800/70">
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                                <i className={`fas ${getModeIcon(item.mode)}`}></i>
                                <span>{item.mode}</span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                                {new Date(item.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-gray-300 mb-4 line-clamp-2" title={item.primaryResult}>
                            {item.primaryResult}
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => onDelete(item.id)}
                                className="text-xs bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-300 font-medium py-1 px-3 rounded-full transition-all"
                                aria-label={`Delete prompt created at ${new Date(item.timestamp).toLocaleString()}`}
                            >
                                <i className="fas fa-trash-alt mr-1"></i> Delete
                            </button>
                            <button 
                                onClick={() => onReuse(item)}
                                className="text-xs bg-purple-500/80 hover:bg-purple-600 text-white font-medium py-1 px-3 rounded-full transition-all flex items-center"
                                aria-label={`Reuse prompt created at ${new Date(item.timestamp).toLocaleString()}`}
                            >
                               <i className="fas fa-sync-alt mr-1"></i> Reuse
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromptHistoryDisplay;
