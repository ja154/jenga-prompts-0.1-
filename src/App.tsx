import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense, CSSProperties } from 'react';
import { getEnhancedPrompt } from './services/geminiService';
import { transformPrompt, validatePrompt } from './services/promptTransformer';
import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS, VIDEO_DURATION_OPTIONS, WORD_COUNT_OPTIONS } from './constants';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure, PromptHistoryItem, PromptHistoryItemOptions } from './types';
import { PromptTemplate } from './templates';
import SuspenseLoader from './components/SuspenseLoader';
import modelSpecs from './model-specs.json';

const PromptLibrary = React.lazy(() => import('./components/PromptLibrary'));

const ThemeToggle = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50" aria-label="Toggle theme">
        <label className="switch">
            <input
                type="checkbox"
                onChange={toggleTheme}
                checked={theme === 'light'}
                aria-label="theme toggle checkbox"
            />
            <span className="slider">
                <span className="star star_1"></span>
                <span className="star star_2"></span>
                <span className="star star_3"></span>
                <svg className="cloud" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 85" >
                    <path d="M 83.5,52.5 C 79.8,42.4 70.3,35.5 59.5,35.5 c -4.1,0 -8,1.2 -11.4,3.4 C 41.5,25.8 31.3,19.5 19.5,19.5 c -12.9,0 -23.4,10.5 -23.4,23.4 c 0,1.9 0.2,3.7 0.7,5.5 C -10.9,52.2 0.5,75.5 0.5,75.5 h 78.1 c 0,0 9.4,-15.8 4.9,-23 z" fill="#fff"></path>
                </svg>
            </span>
        </label>
    </div>
);

const GENERAL_PURPOSE_PRESET = {
    // Photo Defaults
    imageStyle: ImageStyle.DigitalArt,
    lighting: Lighting.NaturalLight,
    framing: Framing.Centered,
    cameraAngle: CameraAngle.Frontal,
    imageResolution: CameraResolution.Standard,
    aspectRatio: AspectRatio.Square,

    // Video Defaults
    pov: PointOfView.StaticShot,
    videoResolution: CameraResolution.HD,

    // Shared Defaults
    contentTone: ContentTone.Neutral,
};

const App = () => {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        // On first visit, check system preference. Otherwise, use stored theme.
        return storedTheme ? storedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.Image);
    const [userPrompt, setUserPrompt] = useState('');
    const [primaryResult, setPrimaryResult] = useState('');
    const [jsonResult, setJsonResult] = useState<string | undefined>();
    const [activeOutputTab, setActiveOutputTab] = useState<'result' | 'json'>('result');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
    const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
    const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

    const inputSectionRef = useRef<HTMLElement>(null);

    // Shared state
    const [contentTone, setContentTone] = useState<ContentTone>(GENERAL_PURPOSE_PRESET.contentTone);
    const [outputStructure, setOutputStructure] = useState<OutputStructure>(OutputStructure.Paragraph);
    
    // Video state
    const [pov, setPov] = useState<PointOfView>(GENERAL_PURPOSE_PRESET.pov);
    const [videoResolution, setVideoResolution] = useState<CameraResolution>(GENERAL_PURPOSE_PRESET.videoResolution);
    const [videoModel, setVideoModel] = useState<string>(Object.keys(modelSpecs['text-to-video'])[0]);
    const [videoDuration, setVideoDuration] = useState<string>('15');
    const [wordCount, setWordCount] = useState<string>('250');

    // Image state
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(GENERAL_PURPOSE_PRESET.aspectRatio);
    const [imageModel, setImageModel] = useState<string>(Object.keys(modelSpecs['text-to-image'])[0]);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(GENERAL_PURPOSE_PRESET.imageStyle);
    const [lighting, setLighting] = useState<Lighting>(GENERAL_PURPOSE_PRESET.lighting);
    const [framing, setFraming] = useState<Framing>(GENERAL_PURPOSE_PRESET.framing);
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>(GENERAL_PURPOSE_PRESET.cameraAngle);
    const [imageResolution, setImageResolution] = useState<CameraResolution>(GENERAL_PURPOSE_PRESET.imageResolution);
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Text state
    const [outputFormat, setOutputFormat] = useState('Plain Text');
    
    // Audio state
    const [audioType, setAudioType] = useState<AudioType>(AudioType.Music);
    const [audioVibe, setAudioVibe] = useState<AudioVibe>(AudioVibe.Atmospheric);

    // Code state
    const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>(CodeLanguage.JavaScript);
    const [codeTask, setCodeTask] = useState<CodeTask>(CodeTask.Generate);

    useEffect(() => {
        if (promptMode === PromptMode.Image || promptMode === PromptMode.Video) {
            const modelKey = promptMode === PromptMode.Image ? imageModel : videoModel;
            const { warnings } = validatePrompt(userPrompt, modelKey, promptMode);
            setValidationWarnings(warnings);
        } else {
            setValidationWarnings([]);
        }
    }, [userPrompt, imageModel, videoModel, promptMode]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('promptHistory');
            if (storedHistory) {
                setPromptHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            setPromptHistory([]);
        }
    }, []);

    useEffect(() => {
        try {
            // Do not save an empty array on first load if history was null
            if(promptHistory.length > 0) {
              localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
            } else {
              // If user clears history, remove the item
              const storedHistory = localStorage.getItem('promptHistory');
              if(storedHistory) {
                  localStorage.removeItem('promptHistory');
              }
            }
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [promptHistory]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleUseTemplate = useCallback((template: PromptTemplate) => {
        setPromptMode(template.mode);
        setUserPrompt(template.prompt);

        // Apply template-specific settings, only if they exist, to pre-configure the UI
        if (template.contentTone) setContentTone(template.contentTone);

        if (template.mode === PromptMode.Image) {
            if (template.imageStyle) setImageStyle(template.imageStyle);
            if (template.lighting) setLighting(template.lighting);
            if (template.framing) setFraming(template.framing);
            if (template.cameraAngle) setCameraAngle(template.cameraAngle);
            if (template.resolution) setImageResolution(template.resolution);
            if (template.aspectRatio) setAspectRatio(template.aspectRatio);
        }

        if (template.mode === PromptMode.Video) {
            if (template.pov) setPov(template.pov);
            if (template.resolution) setVideoResolution(template.resolution);
        }

        // Scroll to the input section to show the user the result
        setTimeout(() => {
            inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    const handleGenerateClick = useCallback(async () => {
        if (!userPrompt.trim()) return;
        
        setIsLoading(true);
        setError('');
        setPrimaryResult('');
        setJsonResult(undefined);
        setActiveOutputTab('result');


        let options: Record<string, any> = {};
        let loadingMsg = 'Our AI is enhancing your prompt...';

        switch (promptMode) {
            case PromptMode.Video:
                loadingMsg = 'Crafting your cinematic video prompt...';
                options = { contentTone, pov, resolution: videoResolution, outputStructure, videoDuration, wordCount, videoModel };
                break;
            case PromptMode.Image:
                loadingMsg = 'Engineering your visual prompt...';
                options = { contentTone, imageStyle, lighting, framing, cameraAngle, resolution: imageResolution, aspectRatio, additionalDetails, outputStructure, wordCount, imageModel };
                break;
            case PromptMode.Text:
                loadingMsg = 'Refining your text prompt...';
                options = { contentTone, outputFormat, outputStructure, wordCount };
                break;
            case PromptMode.Audio:
                loadingMsg = 'Composing your audio prompt...';
                options = { contentTone, audioType, audioVibe, outputStructure, wordCount };
                break;
            case PromptMode.Code:
                loadingMsg = 'Constructing your code prompt...';
                options = { codeLanguage, codeTask, outputStructure };
                break;
        }

        setLoadingMessage(loadingMsg);
        
        try {
            // This logic is now unified for all prompt modes.
            const result = await getEnhancedPrompt({ userPrompt, mode: promptMode, options });

            // The AI is now expected to return a JSON object (as a string, which getEnhancedPrompt parses).
            // We will stringify it for display.
            const resultJson = JSON.stringify(result, null, 2);
            const resultPrompt = resultJson; // The primary result is the JSON itself.

            setPrimaryResult(resultPrompt);
            setJsonResult(resultJson);

            const currentOptions: PromptHistoryItemOptions = {
                contentTone, outputStructure, pov, videoResolution, aspectRatio,
                imageStyle, lighting, framing, cameraAngle, imageResolution,
                additionalDetails, outputFormat, audioType, audioVibe,
                codeLanguage, codeTask,
                imageModel, videoModel,
                videoDuration, wordCount
            };

            const historyItem: PromptHistoryItem = {
                id: Date.now(),
                timestamp: Date.now(),
                mode: promptMode,
                userPrompt,
                primaryResult: resultPrompt,
                jsonResult: resultJson,
                options: currentOptions,
            };

            setPromptHistory(prev => [historyItem, ...prev]);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);

            // Check for our custom cause property with raw text for debugging
            if (err instanceof Error && (err as any).cause?.rawText) {
                const rawText = (err as any).cause.rawText;
                setPrimaryResult(message); // Show error in main result area
                setJsonResult(rawText);   // Show raw response in JSON tab
                setActiveOutputTab('json'); // Switch to JSON tab to show user the problem
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [
        userPrompt, promptMode, contentTone, pov, videoResolution, imageStyle, 
        lighting, framing, cameraAngle, imageResolution, aspectRatio, additionalDetails,
        outputFormat, audioType, audioVibe, codeLanguage, codeTask, outputStructure,
        imageModel, videoModel, videoDuration, wordCount
    ]);

    const handleCopyToClipboard = useCallback(() => {
        const contentToCopy = activeOutputTab === 'json' ? jsonResult : primaryResult;
        if (!contentToCopy || copyStatus !== 'idle') return;

        navigator.clipboard.writeText(contentToCopy ?? '').then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }).catch(() => {
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    }, [primaryResult, jsonResult, activeOutputTab, copyStatus]);

    const buttonText = useMemo(() => {
        if (isLoading) return 'Working...';
        return 'Enhance Prompt';
    }, [isLoading]);

    const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[] | string[]) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{label}</label>
            <select
                id={id}
                className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={value}
                onChange={onChange}
                aria-label={`Select ${label}`}
            >
                {options.map(option => (
                    typeof option === 'string' 
                        ? <option key={option} value={option}>{option}</option>
                        : <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );

    const modeOptions = [
        { mode: PromptMode.Text, icon: 'fa-file-alt' },
        { mode: PromptMode.Image, icon: 'fa-image' },
        { mode: PromptMode.Video, icon: 'fa-video' },
        { mode: PromptMode.Audio, icon: 'fa-music' },
        { mode: PromptMode.Code, icon: 'fa-code' },
    ];
    
    const PromptModeSelector = () => (
        <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Select Prompt Mode</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 p-1 bg-slate-200 dark:bg-gray-800 rounded-xl">
                {modeOptions.map(({ mode, icon }) => (
                    <button
                        key={mode}
                        onClick={() => setPromptMode(mode)}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${promptMode === mode ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-700'}`}
                        aria-pressed={promptMode === mode}
                    >
                        <i className={`fas ${icon} text-base`}></i>
                        <span>{mode}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderModeOptions = () => {
        switch (promptMode) {
            case PromptMode.Text:
                return (
                     <div className="space-y-4">
                        {renderSelect("wordCount", "Word Count", wordCount, (e) => setWordCount(e.target.value), WORD_COUNT_OPTIONS)}
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                        {renderSelect("outputFormat", "Desired Text Format", outputFormat, (e) => setOutputFormat(e.target.value), TEXT_FORMAT_OPTIONS)}
                    </div>
                );
            case PromptMode.Image:
                const imageModelOptions = Object.entries(modelSpecs['text-to-image']).map(([key, value]) => ({ label: value.name, value: key }));
                const currentImageModelSpec = (modelSpecs['text-to-image'] as any)[imageModel];
                const availableAspectRatios = currentImageModelSpec.aspect_ratios.includes('any')
                    ? ASPECT_RATIO_OPTIONS
                    : ASPECT_RATIO_OPTIONS.filter(opt => currentImageModelSpec.aspect_ratios.includes(opt.value));

                return (
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderSelect("imageModel", "Model", imageModel, (e) => setImageModel(e.target.value), imageModelOptions)}
                            {renderSelect("wordCount", "Word Count", wordCount, (e) => setWordCount(e.target.value), WORD_COUNT_OPTIONS)}
                            {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                         </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {renderSelect("contentTone", "Content Tone / Mood", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                           {renderSelect("imageStyle", "Style", imageStyle, (e) => setImageStyle(e.target.value as ImageStyle), IMAGE_STYLE_OPTIONS)}
                           {renderSelect("aspectRatio", "Aspect Ratio", aspectRatio, (e) => setAspectRatio(e.target.value as AspectRatio), availableAspectRatios)}
                           {renderSelect("lighting", "Lighting", lighting, (e) => setLighting(e.target.value as Lighting), LIGHTING_OPTIONS)}
                           {renderSelect("framing", "Framing", framing, (e) => setFraming(e.target.value as Framing), FRAMING_OPTIONS)}
                           {renderSelect("cameraAngle", "Camera Angle", cameraAngle, (e) => setCameraAngle(e.target.value as CameraAngle), CAMERA_ANGLE_OPTIONS)}
                           {renderSelect("imageResolution", "Detail Level", imageResolution, (e) => setImageResolution(e.target.value as CameraResolution), CAMERA_RESOLUTION_OPTIONS)}
                        </div>
                        <div>
                             <label htmlFor="additionalDetails" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Additional Details (Optional)</label>
                             <input
                                id="additionalDetails"
                                type="text"
                                className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="E.g. turquoise rings, stark white background..."
                                value={additionalDetails}
                                onChange={(e) => setAdditionalDetails(e.target.value)}
                                aria-label="Provide additional details"
                            />
                        </div>
                    </div>
                );
            case PromptMode.Video:
                const videoModelOptions = Object.entries(modelSpecs['text-to-video']).map(([key, value]) => ({ label: value.name, value: key }));
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {renderSelect("videoModel", "Model", videoModel, (e) => setVideoModel(e.target.value), videoModelOptions)}
                           {renderSelect("videoDuration", "Video Duration", videoDuration, (e) => setVideoDuration(e.target.value), VIDEO_DURATION_OPTIONS)}
                           {renderSelect("wordCount", "Word Count", wordCount, (e) => setWordCount(e.target.value), WORD_COUNT_OPTIONS)}
                           {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                           {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                           {renderSelect("pov", "Point of View", pov, (e) => setPov(e.target.value as PointOfView), POV_OPTIONS)}
                           {renderSelect("videoResolution", "Detail Level", videoResolution, (e) => setVideoResolution(e.target.value as CameraResolution), CAMERA_RESOLUTION_OPTIONS)}
                        </div>
                    </div>
                );
            case PromptMode.Audio:
                return (
                     <div className="space-y-4">
                        {renderSelect("wordCount", "Word Count", wordCount, (e) => setWordCount(e.target.value), WORD_COUNT_OPTIONS)}
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                            {renderSelect("audioType", "Audio Type", audioType, (e) => setAudioType(e.target.value as AudioType), AUDIO_TYPE_OPTIONS)}
                            {renderSelect("audioVibe", "Vibe / Mood", audioVibe, (e) => setAudioVibe(e.target.value as AudioVibe), AUDIO_VIBE_OPTIONS)}
                        </div>
                    </div>
                );
            case PromptMode.Code:
                 return (
                     <div className="space-y-4">
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderSelect("codeLanguage", "Language", codeLanguage, (e) => setCodeLanguage(e.target.value as CodeLanguage), CODE_LANGUAGE_OPTIONS)}
                            {renderSelect("codeTask", "Task", codeTask, (e) => setCodeTask(e.target.value as CodeTask), CODE_TASK_OPTIONS)}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {/* Input section */}
            <section ref={inputSectionRef} role="region" aria-labelledby="input-heading" className="glass rounded-2xl p-4 sm:p-6 fade-in" style={{ animationDelay: '0.4s' }}>
                 <h2 id="input-heading" className="text-xl font-semibold flex items-center mb-4">
                    <i className="fas fa-keyboard mr-2 text-purple-500 dark:text-purple-400"></i>
                    Step 1: Define Your Prompt
                </h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-800/50 border border-red-400 dark:border-red-700 p-3 rounded-lg text-red-700 dark:text-red-200 mb-4" role="alert">
                        <p className="font-semibold text-sm">An error occurred:</p>
                        <p className="text-xs">{error}</p>
                    </div>
                )}

                <PromptModeSelector />

                <div className="mb-4 relative">
                    <label htmlFor="userPrompt" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Your Core Idea or Concept</label>
                    <textarea
                        id="userPrompt"
                        className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-28"
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

                <div className="mb-6 pt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Step 2: Add Modifiers</label>
                    <div className="p-4 bg-slate-200/50 dark:bg-gray-900/40 rounded-xl">
                        {renderModeOptions()}
                    </div>
                </div>

                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || !userPrompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] glow flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-live="polite"
                >
                    {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
                    {buttonText}
                </button>
            </section>

            {/* Output section */}
            <section role="region" aria-labelledby="output-heading" className="glass rounded-2xl p-4 sm:p-6 fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <h2 id="output-heading" className="text-xl font-semibold flex items-center">
                        <i className="fas fa-sparkles mr-2 text-yellow-500 dark:text-yellow-400"></i>
                        Step 3: Your Enhanced Prompt
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

                <div className="relative bg-slate-100 dark:bg-gray-800 rounded-lg min-h-[20rem] sm:min-h-[24rem] overflow-hidden">
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
                            <p>Your expertly crafted prompt will appear here...</p>
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

            <Suspense fallback={<SuspenseLoader />}>
                <PromptLibrary onUseTemplate={handleUseTemplate} />
            </Suspense>
        </>
    );
};

export default App;
