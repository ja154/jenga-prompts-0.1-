import { ImageStyle, Lighting, Framing, CameraAngle, ContentTone, PointOfView, CameraResolution, AspectRatio, ModifierPreset } from './types';

export const PRESET_NONE: ModifierPreset = {
    name: 'None',
    values: {},
};

export const PRESET_GENERAL_PURPOSE: ModifierPreset = {
  name: 'General Purpose',
  values: {
    imageStyle: ImageStyle.DigitalArt,
    lighting: Lighting.NaturalLight,
    framing: Framing.Centered,
    cameraAngle: CameraAngle.Frontal,
    resolution: CameraResolution.Standard,
    aspectRatio: AspectRatio.Square,
    contentTone: ContentTone.Neutral,
    pov: PointOfView.StaticShot,
  },
};

export const PRESET_REALISTIC_POLAROID: ModifierPreset = {
  name: 'Realistic Polaroid',
  values: {
    imageStyle: ImageStyle.Polaroid,
    lighting: Lighting.HarshDirectFlash,
    framing: Framing.Cropped,
    cameraAngle: CameraAngle.DutchAngle,
    contentTone: ContentTone.Neutral, // Defaulting to neutral
  },
};


export const IMAGE_PRESETS: ModifierPreset[] = [
    PRESET_NONE,
    PRESET_GENERAL_PURPOSE,
    PRESET_REALISTIC_POLAROID,
];

export const VIDEO_PRESETS: ModifierPreset[] = [
    PRESET_NONE,
    PRESET_GENERAL_PURPOSE,
];
