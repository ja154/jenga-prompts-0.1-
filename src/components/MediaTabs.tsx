import React from 'react';
import { PromptMode } from '../types';

interface MediaTabsProps {
    promptMode: PromptMode;
    setPromptMode: (mode: PromptMode) => void;
}

const MediaTabs = ({ promptMode, setPromptMode }: MediaTabsProps) => {
    const modeOptions = [
        { mode: PromptMode.Text, icon: 'fa-file-alt', label: 'Text' },
        { mode: PromptMode.Image, icon: 'fa-image', label: 'Image' },
        { mode: PromptMode.Video, icon: 'fa-video', label: 'Video' },
        { mode: PromptMode.Audio, icon: 'fa-music', label: 'Audio' },
        { mode: PromptMode.Code, icon: 'fa-code', label: 'Code' },
    ];

    return (
        <div className="mb-6">
            <div className="grid grid-cols-5 gap-1 p-1 bg-muted rounded-xl">
                {modeOptions.map(({ mode, icon, label }) => (
                    <button
                        key={mode}
                        onClick={() => setPromptMode(mode)}
                        className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${promptMode === mode ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent'}`}
                        aria-pressed={promptMode === mode}
                    >
                        <i className={`fas ${icon} text-base`}></i>
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MediaTabs;
