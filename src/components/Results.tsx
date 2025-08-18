import React, { CSSProperties } from 'react';

interface ResultsProps {
    primaryResult: string;
    jsonResult?: string;
    isLoading: boolean;
    loadingMessage: string;
    activeOutputTab: 'result' | 'json';
    setActiveOutputTab: (tab: 'result' | 'json') => void;
    handleCopyToClipboard: () => void;
    copyStatus: 'idle' | 'copied' | 'error';
}

const Results = ({ primaryResult, jsonResult, isLoading, loadingMessage, activeOutputTab, setActiveOutputTab, handleCopyToClipboard, copyStatus }: ResultsProps) => {
    return (
        <section role="region" aria-labelledby="output-heading" className="glass rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <h2 id="output-heading" className="text-xl font-semibold flex items-center">
                    <i className="fas fa-sparkles mr-2 text-yellow-500 dark:text-yellow-400"></i>
                    Your JengaPrompt
                </h2>
                 <div className="flex items-center space-x-2">
                    <button
                        onClick={handleCopyToClipboard}
                        disabled={!primaryResult || isLoading || copyStatus !== 'idle'}
                        className="text-xs bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 px-2 sm:px-3 py-1.5 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                        aria-label="Copy result to clipboard"
                    >
                        {copyStatus === 'copied' ? (
                            <>
                                <i className="fas fa-check mr-1 text-green-500"></i>
                                <span>Copied!</span>
                            </>
                        ) : copyStatus === 'error' ? (
                            <>
                                <i className="fas fa-times mr-1 text-red-500"></i>
                                <span>Failed</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-copy mr-1"></i>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="relative bg-slate-100 dark:bg-gray-800 rounded-lg min-h-[16rem] sm:min-h-[20rem] overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-slate-100/80 dark:bg-gray-800/80 z-10">
                        <div className="text-center text-slate-500 dark:text-gray-400">
                            <i className="fas fa-brain fa-beat-fade text-4xl text-purple-500 dark:text-purple-400 mb-4" style={{'--fa-animation-duration': '2s'} as CSSProperties}></i>
                            <p>{loadingMessage || 'Working...'}</p>
                        </div>
                    </div>
                )}

                {!isLoading && !primaryResult && (
                    <div className="text-slate-500 dark:text-gray-400 italic h-full flex items-center justify-center p-4 text-center">
                        <p>Generated prompt will appear here...</p>
                    </div>
                )}

                {primaryResult && (
                    <>
                        <div className="absolute top-2 left-2 right-2 z-20 flex space-x-1 p-1 bg-slate-200/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg" role="tablist">
                            <button
                                role="tab"
                                aria-selected={activeOutputTab === 'result'}
                                onClick={() => setActiveOutputTab('result')}
                                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeOutputTab === 'result' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-700'}`}
                            >
                                Result
                            </button>
                            {jsonResult && (
                                 <button
                                    role="tab"
                                    aria-selected={activeOutputTab === 'json'}
                                    onClick={() => setActiveOutputTab('json')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeOutputTab === 'json' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-700'}`}
                                >
                                    JSON
                                </button>
                            )}
                        </div>
                        <textarea
                            value={activeOutputTab === 'json' ? jsonResult : primaryResult}
                            readOnly
                            aria-label="Enhanced prompt result"
                            className="absolute inset-0 w-full h-full bg-transparent border-0 ring-0 focus:ring-1 focus:ring-purple-500 focus:outline-none rounded-lg p-3 sm:p-4 pt-14 text-slate-800 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm resize-none"
                        />
                    </>
                )}
            </div>
        </section>
    );
};

export default Results;
