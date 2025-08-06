import { useState, useMemo } from 'react';
import { PromptMode } from '../types';
import { PromptTemplate, templates } from '../templates';

interface PromptLibraryProps {
    onUseTemplate: (template: PromptTemplate) => void;
}

const PromptLibrary = ({ onUseTemplate }: PromptLibraryProps) => {
    const [activeTab, setActiveTab] = useState<PromptMode>(PromptMode.Image);

    const filteredTemplates = useMemo(() => templates.filter(t => t.mode === activeTab), [activeTab]);

    const tabOptions = [
        { mode: PromptMode.Image, icon: 'fa-image', label: 'Image Prompts' },
        { mode: PromptMode.Video, icon: 'fa-video', label: 'Video Prompts' },
    ];

    return (
        <section className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12 fade-in" style={{ animationDelay: '1s' }} aria-labelledby="library-heading">
            <h2 id="library-heading" className="text-2xl sm:text-3xl font-bold mb-6 text-center gradient-text">Prompt Library</h2>
            <div className="flex justify-center mb-6">
                <div className="p-1 bg-slate-200 dark:bg-gray-800 rounded-xl flex space-x-1">
                    {tabOptions.map(({ mode, icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => setActiveTab(mode)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === mode ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-700'}`}
                            aria-pressed={activeTab === mode}
                        >
                            <i className={`fas ${icon} text-base`}></i>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-gray-800/50 hover:bg-slate-200 dark:hover:bg-gray-800/70 p-6 rounded-xl transition-all transform hover:-translate-y-1 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">{template.title}</h3>
                        <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 flex-grow">{template.description}</p>
                        <button 
                            onClick={() => onUseTemplate(template)}
                            className="mt-auto bg-purple-500/80 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center"
                        >
                            <i className="fas fa-wand-magic-sparkles mr-2"></i>
                            Use Template
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromptLibrary;
