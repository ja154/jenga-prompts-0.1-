import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getEnhancedPrompt } from './services/geminiService';
import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS } from './constants';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure, PromptHistoryItem, PromptHistoryItemOptions } from './types';

const App = () => {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.Text);
    const [userPrompt, setUserPrompt] = useState('');
    const [primaryResult, setPrimaryResult] = useState('');
    const [jsonResult, setJsonResult] = useState<string | undefined>();
    const [activeOutputTab, setActiveOutputTab] = useState<'plain' | 'json'>('plain');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);

    // Shared state
    const [contentTone, setContentTone] = useState<ContentTone>(ContentTone.Neutral);
    const [outputStructure, setOutputStructure] = useState<OutputStructure>(OutputStructure.Paragraph);
    
    // Video state
    const [pov, setPov] = useState<PointOfView>(PointOfView.ThirdPerson);
    const [videoResolution, setVideoResolution] = useState<CameraResolution>(CameraResolution.FourK);

    // Image state
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Landscape);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Cinematic);
    const [lighting, setLighting] = useState<Lighting>(Lighting.GoldenHour);
    const [framing, setFraming] = useState<Framing>(Framing.MediumShot);
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CameraAngle.Frontal);
    const [imageResolution, setImageResolution] = useState<CameraResolution>(CameraResolution.Hyperdetailed);
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Text state
    const [outputFormat, setOutputFormat] = useState('Default');
    
    // Audio state
    const [audioType, setAudioType] = useState<AudioType>(AudioType.Music);
    const [audioVibe, setAudioVibe] = useState<AudioVibe>(AudioVibe.Atmospheric);

    // Code state
    const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>(CodeLanguage.JavaScript);
    const [codeTask, setCodeTask] = useState<CodeTask>(CodeTask.Generate);

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
            if(promptHistory.length > 0) {
              localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
            } else {
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

    const handleGenerateClick = useCallback(async () => {
        if (!userPrompt.trim()) return;
        
        setIsLoading(true);
        setError('');
        setPrimaryResult('');
        setJsonResult(undefined);
        setActiveOutputTab('plain');

        let options: Record<string, any> = {};
        let loadingMsg = 'Our AI is enhancing your prompt...';

        switch (promptMode) {
            case PromptMode.Video:
                loadingMsg = 'Crafting your cinematic video prompt...';
                options = { contentTone, pov, resolution: videoResolution, outputStructure };
                break;
            case PromptMode.Image:
                loadingMsg = 'Engineering your visual prompt...';
                options = { contentTone, imageStyle, lighting, framing, cameraAngle, resolution: imageResolution, aspectRatio, additionalDetails, outputStructure };
                break;
            case PromptMode.Text:
                loadingMsg = 'Refining your text prompt...';
                options = { contentTone, outputFormat, outputStructure };
                break;
            case PromptMode.Audio:
                loadingMsg = 'Composing your audio prompt...';
                options = { contentTone, audioType, audioVibe, outputStructure };
                break;
            case PromptMode.Code:
                loadingMsg = 'Constructing your code prompt...';
                options = { codeLanguage, codeTask, outputStructure };
                break;
        }

        setLoadingMessage(loadingMsg);
        
        try {
            const result = await getEnhancedPrompt({ userPrompt, mode: promptMode, options });
            setPrimaryResult(result.prompt);
            setJsonResult(JSON.stringify(result, null, 2));

            const currentOptions: PromptHistoryItemOptions = {
                contentTone, outputStructure, pov, videoResolution, aspectRatio,
                imageStyle, lighting, framing, cameraAngle, imageResolution,
                additionalDetails, outputFormat, audioType, audioVibe,
                codeLanguage, codeTask
            };

            const historyItem: PromptHistoryItem = {
                id: Date.now(),
                timestamp: Date.now(),
                mode: promptMode,
                userPrompt,
                primaryResult: result.prompt,
                jsonResult: JSON.stringify(result, null, 2),
                options: currentOptions,
            };

            setPromptHistory(prev => [historyItem, ...prev]);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [
        userPrompt, promptMode, contentTone, pov, videoResolution, imageStyle, 
        lighting, framing, cameraAngle, imageResolution, aspectRatio, additionalDetails,
        outputFormat, audioType, audioVibe, codeLanguage, codeTask, outputStructure
    ]);

    const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[] | string[]) => (
        <React.Fragment key={id}>
            <label htmlFor={id}>{label}</label>
            <select
                id={id}
                value={value}
                onChange={onChange}
            >
                {options.map(option => (
                    typeof option === 'string' 
                        ? <option key={option} value={option}>{option}</option>
                        : <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </React.Fragment>
    );
    
    const renderModeOptions = () => {
        switch (promptMode) {
            case PromptMode.Text:
                return (
                     <>
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        {renderSelect("contentTone", "Content Tone / Mood", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                        {renderSelect("outputFormat", "Desired Text Format", outputFormat, (e) => setOutputFormat(e.target.value), TEXT_FORMAT_OPTIONS)}
                    </>
                );
            case PromptMode.Image:
                return (
                    <>
                       {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                       {renderSelect("contentTone", "Content Tone / Mood", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                       {renderSelect("imageStyle", "Style", imageStyle, (e) => setImageStyle(e.target.value as ImageStyle), IMAGE_STYLE_OPTIONS)}
                       {renderSelect("aspectRatio", "Aspect Ratio", aspectRatio, (e) => setAspectRatio(e.target.value as AspectRatio), ASPECT_RATIO_OPTIONS)}
                       {renderSelect("lighting", "Lighting", lighting, (e) => setLighting(e.target.value as Lighting), LIGHTING_OPTIONS)}
                       {renderSelect("framing", "Framing", framing, (e) => setFraming(e.target.value as Framing), FRAMING_OPTIONS)}
                       {renderSelect("cameraAngle", "Camera Angle", cameraAngle, (e) => setCameraAngle(e.target.value as CameraAngle), CAMERA_ANGLE_OPTIONS)}
                       {renderSelect("imageResolution", "Detail Level", imageResolution, (e) => setImageResolution(e.target.value as CameraResolution), CAMERA_RESOLUTION_OPTIONS)}
                        <label htmlFor="additionalDetails">Additional Details</label>
                         <input
                            id="additionalDetails"
                            type="text"
                            placeholder="E.g. turquoise rings, stark white background..."
                            value={additionalDetails}
                            onChange={(e) => setAdditionalDetails(e.target.value)}
                        />
                    </>
                );
            case PromptMode.Video:
                return (
                    <>
                       {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                       {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                       {renderSelect("pov", "Point of View", pov, (e) => setPov(e.target.value as PointOfView), POV_OPTIONS)}
                       {renderSelect("videoResolution", "Detail Level", videoResolution, (e) => setVideoResolution(e.target.value as CameraResolution), CAMERA_RESOLUTION_OPTIONS)}
                    </>
                );
            case PromptMode.Audio:
                return (
                     <>
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                        {renderSelect("audioType", "Audio Type", audioType, (e) => setAudioType(e.target.value as AudioType), AUDIO_TYPE_OPTIONS)}
                        {renderSelect("audioVibe", "Vibe / Mood", audioVibe, (e) => setAudioVibe(e.target.value as AudioVibe), AUDIO_VIBE_OPTIONS)}
                    </>
                );
            case PromptMode.Code:
                 return (
                     <>
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        {renderSelect("codeLanguage", "Language", codeLanguage, (e) => setCodeLanguage(e.target.value as CodeLanguage), CODE_LANGUAGE_OPTIONS)}
                        {renderSelect("codeTask", "Task", codeTask, (e) => setCodeTask(e.target.value as CodeTask), CODE_TASK_OPTIONS)}
                    </>
                );
            default:
                return null;
        }
    }

    const templatesData: Record<PromptMode, string[]> = {
        [PromptMode.Text]: ["Blog Intro", "Product Description", "Story Prompt"],
        [PromptMode.Image]: ["Landscape Scene", "Character Portrait", "Abstract Art"],
        [PromptMode.Video]: ["Short Ad Script", "Explainer Video", "Tutorial Script"],
        [PromptMode.Audio]: ["Podcast Intro", "Radio Ad", "Narration Script"],
        [PromptMode.Code]: ["Python Script", "HTML Landing Page", "API Request Example"]
    };

    const renderTemplates = () => {
        const currentTemplates = templatesData[promptMode] || [];
        return currentTemplates.map(t => (
            <div key={t} className="card" onClick={() => setUserPrompt(t)}>
                {t}
            </div>
        ));
    };

    return (
        <>
            <div className="pattern-background"></div>
            <div className="sidebar">
                <img src="/logo.png" alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'}/>
                <h1>JengaPrompts</h1>
                <nav>
                    <button>Home</button>
                    <button>Community</button>
                    <button>JengaSuite</button>
                    <button>Templates</button>
                    <button>My Creations</button>
                    <button>Subscription</button>
                    <button>Help</button>
                </nav>
            </div>

            <div className="main">
                <div className="header">
                    <div className="header-left">JENGAPROMPTS</div>
                    <div className="header-right">
                        <button onClick={toggleTheme}>🌓</button>
                        <button>⚙️</button>
                        <button>👤</button>
                    </div>
                </div>

                <div style={{ padding: '0 1rem' }}>
                    <div className="content-types">
                        <button onClick={() => setPromptMode(PromptMode.Text)}>Text</button>
                        <button onClick={() => setPromptMode(PromptMode.Image)}>Image</button>
                        <button onClick={() => setPromptMode(PromptMode.Video)}>Video</button>
                        <button onClick={() => setPromptMode(PromptMode.Audio)}>Audio</button>
                        <button onClick={() => setPromptMode(PromptMode.Code)}>Code</button>
                    </div>

                    {error && <div className="glass" style={{ borderRadius: '1rem', marginBottom: '1rem', padding: '1rem', color: 'red' }}>{error}</div>}

                    <div className="glass" style={{ borderRadius: '1rem', marginBottom: '1rem' }}>
                        <div className="prompt-section">
                            <textarea
                                placeholder="Enter your prompt..."
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                            />
                            <button onClick={handleGenerateClick} disabled={isLoading}>
                                {isLoading ? loadingMessage : 'Enhance Prompt'}
                            </button>
                        </div>
                    </div>

                    <div className="glass" style={{ borderRadius: '1rem', marginBottom: '1rem' }}>
                        <div className="modifiers">
                            <details open>
                                <summary>Modifiers</summary>
                                {renderModeOptions()}
                            </details>
                        </div>
                    </div>

                    <div className="glass" style={{ borderRadius: '1rem', marginBottom: '1rem' }}>
                        <div className="output-section">
                            <div className="output-toggle">
                                <button onClick={() => setActiveOutputTab('plain')}>Plain Text</button>
                                <button onClick={() => setActiveOutputTab('json')}>JSON</button>
                            </div>
                            <textarea
                                placeholder="Output..."
                                rows={6}
                                value={activeOutputTab === 'plain' ? primaryResult : jsonResult}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="glass" style={{ borderRadius: '1rem', marginBottom: '1rem' }}>
                        <div className="templates">
                            <h3>Templates</h3>
                            <div className="template-cards">
                                {renderTemplates()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
