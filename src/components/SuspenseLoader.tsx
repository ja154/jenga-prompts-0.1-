import React from 'react';

const SuspenseLoader = () => {
    return (
        <div className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12 flex items-center justify-center min-h-[200px]">
            <div className="text-center text-slate-500 dark:text-gray-400">
                <i className="fas fa-spinner fa-spin text-3xl text-purple-500 dark:text-purple-400"></i>
                <p className="mt-4">Loading Section...</p>
            </div>
        </div>
    );
};

export default SuspenseLoader;
