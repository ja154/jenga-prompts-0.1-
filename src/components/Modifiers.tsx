import React from 'react';
import { PromptMode, ContentTone, PointOfView, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure } from '../types';
import { TONE_OPTIONS, POV_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, LIGHTING_OPTIONS, FRAMING_OPTIONS, CAMERA_ANGLE_OPTIONS, CAMERA_RESOLUTION_OPTIONS, TEXT_FORMAT_OPTIONS, AUDIO_TYPE_OPTIONS, AUDIO_VIBE_OPTIONS, CODE_LANGUAGE_OPTIONS, CODE_TASK_OPTIONS, OUTPUT_STRUCTURE_OPTIONS, VIDEO_DURATION_OPTIONS, WORD_COUNT_OPTIONS } from '../constants';
import modelSpecs from '../model-specs.json';

interface ModifiersProps {
    promptMode: PromptMode;
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
}

const Modifiers = (props: ModifiersProps) => {
    const {
        promptMode, contentTone, setContentTone, outputStructure, setOutputStructure,
        pov, setPov, videoResolution, setVideoResolution, videoModel, setVideoModel,
        videoDuration, setVideoDuration, wordCount, setWordCount, aspectRatio, setAspectRatio,
        imageModel, setImageModel, imageStyle, setImageStyle, lighting, setLighting,
        framing, setFraming, cameraAngle, setCameraAngle, imageResolution, setImageResolution,
        additionalDetails, setAdditionalDetails, outputFormat, setOutputFormat, audioType,
        setAudioType, audioVibe, setAudioVibe, codeLanguage, setCodeLanguage, codeTask, setCodeTask
    } = props;

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

    const renderModeOptions = () => {
        switch (promptMode) {
            case PromptMode.Text:
                return (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {renderSelect("videoModel", "Model", videoModel, (e) => setVideoModel(e.target.value), videoModelOptions)}
                       {renderSelect("videoDuration", "Video Duration", videoDuration, (e) => setVideoDuration(e.target.value), VIDEO_DURATION_OPTIONS)}
                       {renderSelect("wordCount", "Word Count", wordCount, (e) => setWordCount(e.target.value), WORD_COUNT_OPTIONS)}
                       {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                       {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                       {renderSelect("pov", "Point of View", pov, (e) => setPov(e.target.value as PointOfView), POV_OPTIONS)}
                       {renderSelect("videoResolution", "Detail Level", videoResolution, (e) => setVideoResolution(e.target.value as CameraResolution), CAMERA_RESOLUTION_OPTIONS)}
                    </div>
                );
            case PromptMode.Audio:
                return (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderSelect("wordCount", "Word Count", wordCount, (e) => setWordCount(e.target.value), WORD_COUNT_OPTIONS)}
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        {renderSelect("contentTone", "Content Tone", contentTone, (e) => setContentTone(e.target.value as ContentTone), TONE_OPTIONS)}
                        {renderSelect("audioType", "Audio Type", audioType, (e) => setAudioType(e.target.value as AudioType), AUDIO_TYPE_OPTIONS)}
                        {renderSelect("audioVibe", "Vibe / Mood", audioVibe, (e) => setAudioVibe(e.target.value as AudioVibe), AUDIO_VIBE_OPTIONS)}
                    </div>
                );
            case PromptMode.Code:
                 return (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderSelect("outputStructure", "Output Format", outputStructure, (e) => setOutputStructure(e.target.value as OutputStructure), OUTPUT_STRUCTURE_OPTIONS)}
                        {renderSelect("codeLanguage", "Language", codeLanguage, (e) => setCodeLanguage(e.target.value as CodeLanguage), CODE_LANGUAGE_OPTIONS)}
                        {renderSelect("codeTask", "Task", codeTask, (e) => setCodeTask(e.target.value as CodeTask), CODE_TASK_OPTIONS)}
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="mb-6 pt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Jenga Your Prompt</label>
            <div className="p-4 bg-slate-200/50 dark:bg-gray-900/40 rounded-xl">
                {renderModeOptions()}
            </div>
        </div>
    );
};

export default Modifiers;
