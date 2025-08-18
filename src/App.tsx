import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext as useReactRouterOutletContext } from 'react-router-dom';
import { getEnhancedPrompt } from './services/geminiService';
import { validatePrompt } from './services/promptTransformer';
import { ContentTone, PointOfView, PromptMode, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure, PromptHistoryItem, PromptHistoryItemOptions } from './types';
import { PromptTemplate } from './templates';
import modelSpecs from './model-specs.json';
import Layout from './components/Layout';
import MediaTabs from './components/MediaTabs';
import InputInterface from './components/InputInterface';
import Modifiers from './components/Modifiers';
import Generate from './components/Generate';
import Results from './components/Results';
import TemplatesGallery from './components/TemplatesGallery';
import AIContent from './components/AIContent';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import SuspenseLoader from './components/SuspenseLoader';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import History from './pages/History';
import Login from './pages/Login';

type AppContextType = {
    theme: string;
    toggleTheme: () => void;
    promptMode: PromptMode;
    setPromptMode: (mode: PromptMode) => void;
    userPrompt: string;
    setUserPrompt: (prompt: string) => void;
    primaryResult: string;
    jsonResult: string | undefined;
    activeOutputTab: 'result' | 'json';
    setActiveOutputTab: (tab: 'result' | 'json') => void;
    isLoading: boolean;
    loadingMessage: string;
    error: string;
    copyStatus: 'idle' | 'copied' | 'error';
    promptHistory: PromptHistoryItem[];
    validationWarnings: string[];
    handleUseTemplate: (template: PromptTemplate) => void;
    handleGenerateClick: () => void;
    handleCopyToClipboard: () => void;
    contentTone: ContentTone;
    setContentTone: (tone: ContentTone) => void;
    outputStructure: OutputStructure;
    setOutputStructure: (structure: OutputStructure) => void;
    pov: PointOfView;
    setPov: (pov: PointOfView) => void;
    videoResolution: CameraResolution;
    setVideoResolution: (resolution: CameraResolution) => void;
    videoModel: string;
    setVideoModel: (model: string) => void;
    videoDuration: string;
    setVideoDuration: (duration: string) => void;
    wordCount: string;
    setWordCount: (count: string) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    imageModel: string;
    setImageModel: (model: string) => void;
    imageStyle: ImageStyle;
    setImageStyle: (style: ImageStyle) => void;
    lighting: Lighting;
    setLighting: (lighting: Lighting) => void;
    framing: Framing;
    setFraming: (framing: Framing) => void;
    cameraAngle: CameraAngle;
    setCameraAngle: (angle: CameraAngle) => void;
    imageResolution: CameraResolution;
    setImageResolution: (resolution: CameraResolution) => void;
    additionalDetails: string;
    setAdditionalDetails: (details: string) => void;
    outputFormat: string;
    setOutputFormat: (format: string) => void;
    audioType: AudioType;
    setAudioType: (type: AudioType) => void;
    audioVibe: AudioVibe;
    setAudioVibe: (vibe: AudioVibe) => void;
    codeLanguage: CodeLanguage;
    setCodeLanguage: (language: CodeLanguage) => void;
    codeTask: CodeTask;
    setCodeTask: (task: CodeTask) => void;
};

function useAppOutletContext() {
    return useReactRouterOutletContext<AppContextType>();
}

const AppLogicContainer = () => {
    // All the state and handlers are managed here
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.Text);
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
    const [contentTone, setContentTone] = useState<ContentTone>(ContentTone.Neutral);
    const [outputStructure, setOutputStructure] = useState<OutputStructure>(OutputStructure.Paragraph);
    const [pov, setPov] = useState<PointOfView>(PointOfView.ThirdPerson);
    const [videoResolution, setVideoResolution] = useState<CameraResolution>(CameraResolution.FourK);
    const [videoModel, setVideoModel] = useState<string>(Object.keys(modelSpecs['text-to-video'])[0]);
    const [videoDuration, setVideoDuration] = useState<string>('15');
    const [wordCount, setWordCount] = useState<string>('250');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Landscape);
    const [imageModel, setImageModel] = useState<string>(Object.keys(modelSpecs['text-to-image'])[0]);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Cinematic);
    const [lighting, setLighting] = useState<Lighting>(Lighting.GoldenHour);
    const [framing, setFraming] = useState<Framing>(Framing.MediumShot);
    const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CameraAngle.Frontal);
    const [imageResolution, setImageResolution] = useState<CameraResolution>(CameraResolution.Hyperdetailed);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [outputFormat, setOutputFormat] = useState('Plain Text');
    const [audioType, setAudioType] = useState<AudioType>(AudioType.Music);
    const [audioVibe, setAudioVibe] = useState<AudioVibe>(AudioVibe.Atmospheric);
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

    const handleUseTemplate = useCallback((template: PromptTemplate) => {
        setPromptMode(template.mode);
        setUserPrompt(template.prompt);
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
            const result = await getEnhancedPrompt({ userPrompt, mode: promptMode, options });
            const resultJson = JSON.stringify(result, null, 2);
            const resultPrompt = resultJson;
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
            if (err instanceof Error && (err as any).cause?.rawText) {
                const rawText = (err as any).cause.rawText;
                setPrimaryResult(message);
                setJsonResult(rawText);
                setActiveOutputTab('json');
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [userPrompt, promptMode, contentTone, pov, videoResolution, imageStyle, lighting, framing, cameraAngle, imageResolution, aspectRatio, additionalDetails, outputFormat, audioType, audioVibe, codeLanguage, codeTask, outputStructure, imageModel, videoModel, videoDuration, wordCount]);

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

    const contextValue: AppContextType = {
        theme, toggleTheme, promptMode, setPromptMode, userPrompt, setUserPrompt,
        primaryResult, jsonResult, activeOutputTab, setActiveOutputTab, isLoading,
        loadingMessage, error, copyStatus, promptHistory, validationWarnings,
        handleUseTemplate, handleGenerateClick, handleCopyToClipboard, contentTone,
        setContentTone, outputStructure, setOutputStructure, pov, setPov, videoResolution,
        setVideoResolution, videoModel, setVideoModel, videoDuration, setVideoDuration,
        wordCount, setWordCount, aspectRatio, setAspectRatio, imageModel, setImageModel,
        imageStyle, setImageStyle, lighting, setLighting, framing, setFraming, cameraAngle,
        setCameraAngle, imageResolution, setImageResolution, additionalDetails,
        setAdditionalDetails, outputFormat, setOutputFormat, audioType, setAudioType,
        audioVibe, setAudioVibe, codeLanguage, setCodeLanguage, codeTask, setCodeTask,
    };

    return (
        <>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Layout>
                <Outlet context={contextValue} />
            </Layout>
        </>
    );
};

const MainApp = () => {
    const context = useAppOutletContext();
    return (
        <div className="space-y-6">
            <MediaTabs promptMode={context.promptMode} setPromptMode={context.setPromptMode} />
            <InputInterface userPrompt={context.userPrompt} setUserPrompt={context.setUserPrompt} validationWarnings={context.validationWarnings} />
            <Modifiers
                promptMode={context.promptMode}
                contentTone={context.contentTone} setContentTone={context.setContentTone}
                outputStructure={context.outputStructure} setOutputStructure={context.setOutputStructure}
                pov={context.pov} setPov={context.setPov}
                videoResolution={context.videoResolution} setVideoResolution={context.setVideoResolution}
                videoModel={context.videoModel} setVideoModel={context.setVideoModel}
                videoDuration={context.videoDuration} setVideoDuration={context.setVideoDuration}
                wordCount={context.wordCount} setWordCount={context.setWordCount}
                aspectRatio={context.aspectRatio} setAspectRatio={context.setAspectRatio}
                imageModel={context.imageModel} setImageModel={context.setImageModel}
                imageStyle={context.imageStyle} setImageStyle={context.setImageStyle}
                lighting={context.lighting} setLighting={context.setLighting}
                framing={context.framing} setFraming={context.setFraming}
                cameraAngle={context.cameraAngle} setCameraAngle={context.setCameraAngle}
                imageResolution={context.imageResolution} setImageResolution={context.setImageResolution}
                additionalDetails={context.additionalDetails} setAdditionalDetails={context.setAdditionalDetails}
                outputFormat={context.outputFormat} setOutputFormat={context.setOutputFormat}
                audioType={context.audioType} setAudioType={context.setAudioType}
                audioVibe={context.audioVibe} setAudioVibe={context.setAudioVibe}
                codeLanguage={context.codeLanguage} setCodeLanguage={context.setCodeLanguage}
                codeTask={context.codeTask} setCodeTask={context.setCodeTask}
            />
            <Generate isLoading={context.isLoading} userPrompt={context.userPrompt} handleGenerateClick={context.handleGenerateClick} />
            <Results
                primaryResult={context.primaryResult}
                jsonResult={context.jsonResult}
                isLoading={context.isLoading}
                loadingMessage={context.loadingMessage}
                activeOutputTab={context.activeOutputTab}
                setActiveOutputTab={context.setActiveOutputTab}
                handleCopyToClipboard={context.handleCopyToClipboard}
                copyStatus={context.copyStatus}
            />
            <Suspense fallback={<SuspenseLoader />}>
                <TemplatesGallery onUseTemplate={context.handleUseTemplate} />
            </Suspense>
            <AIContent />
            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLogicContainer />}>
                    <Route index element={<MainApp />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="history" element={<History />} />
                    <Route path="login" element={<Login />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
