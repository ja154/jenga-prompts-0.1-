import { ContentTone, PointOfView, AspectRatio, ImageStyle, Lighting, Framing, CameraAngle, CameraResolution, AudioType, AudioVibe, CodeLanguage, CodeTask, OutputStructure } from './types';

export const TONE_OPTIONS = Object.values(ContentTone);
export const POV_OPTIONS = Object.values(PointOfView);
export const OUTPUT_STRUCTURE_OPTIONS = Object.values(OutputStructure);

export const ASPECT_RATIO_OPTIONS = [
  { label: 'Default', value: AspectRatio.Default },
  { label: 'Square (1:1)', value: AspectRatio.Square },
  { label: 'Landscape (16:9)', value: AspectRatio.Landscape },
  { label: 'Portrait (9:16)', value: AspectRatio.Portrait },
  { label: 'Photo (4:5)', value: AspectRatio.Photo },
  { label: 'Wide (4:3)', value: AspectRatio.Wide },
  { label: 'Tall (3:4)', value: AspectRatio.Tall },
];

export const IMAGE_STYLE_OPTIONS = Object.values(ImageStyle);
export const LIGHTING_OPTIONS = Object.values(Lighting);
export const FRAMING_OPTIONS = Object.values(Framing);
export const CAMERA_ANGLE_OPTIONS = Object.values(CameraAngle);
export const CAMERA_RESOLUTION_OPTIONS = Object.values(CameraResolution);

export const TEXT_FORMAT_OPTIONS = ['Plain Text', 'Markdown', 'JSON'];
export const AUDIO_TYPE_OPTIONS = Object.values(AudioType);
export const AUDIO_VIBE_OPTIONS = Object.values(AudioVibe);
export const CODE_LANGUAGE_OPTIONS = Object.values(CodeLanguage);
export const CODE_TASK_OPTIONS = Object.values(CodeTask);

export const VIDEO_DURATION_OPTIONS = [
    { label: 'Up to 6 seconds', value: '6' },
    { label: 'Up to 15 seconds', value: '15' },
    { label: 'Up to 30 seconds', value: '30' },
];

export const WORD_COUNT_OPTIONS = [
    { label: 'Brief (~100 words)', value: '100' },
    { label: 'Standard (~250 words)', value: '250' },
    { label: 'Detailed (~500 words)', value: '500' },
];
