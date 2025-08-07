import { PromptMode, ImageStyle, Lighting, Framing, CameraAngle, ContentTone, PointOfView, CameraResolution, AspectRatio } from './types';

export interface PromptTemplate {
  title: string;
  description: string;
  prompt: string; // Now a core idea, not a full prompt
  mode: PromptMode;
  // Optional modifiers to pre-configure the UI
  imageStyle?: ImageStyle;
  lighting?: Lighting;
  framing?: Framing;
  cameraAngle?: CameraAngle;
  contentTone?: ContentTone;
  pov?: PointOfView;
  resolution?: CameraResolution;
  aspectRatio?: AspectRatio;
}

export const templates: PromptTemplate[] = [
  // Image Templates
  {
    title: 'Realistic Polaroid Photo',
    description: 'Generates a realistic, awkwardly-framed polaroid with harsh flash and film texture.',
    prompt: 'a cat sleeping on a bookshelf',
    mode: PromptMode.Image,
    imageStyle: ImageStyle.Polaroid,
    lighting: Lighting.HarshDirectFlash,
    framing: Framing.Cropped,
    cameraAngle: CameraAngle.DutchAngle,
  },
  {
    title: 'Classic Disney Character',
    description: 'Transforms a character description into the classic, hand-drawn Disney animation style.',
    prompt: 'a friendly librarian with glasses',
    mode: PromptMode.Image,
    imageStyle: ImageStyle.ClassicAnimation,
    contentTone: ContentTone.Whimsical,
    framing: Framing.MediumShot,
    lighting: Lighting.SoftStudio,
  },
  {
    title: 'Your Home As A LEGO Set',
    description: 'Renders a house as a photorealistic LEGO Creator Expert playset, complete with box art.',
    prompt: 'a cozy, two-story suburban house with a large front porch',
    mode: PromptMode.Image,
    imageStyle: ImageStyle.Hyperrealistic,
    lighting: Lighting.SoftStudio,
    framing: Framing.EstablishingShot,
  },
  {
    title: 'Collectible Beanie Baby',
    description: 'Creates a photo of a custom, 1990s-style collectible Beanie Baby plush toy with a tag.',
    prompt: 'a cute golden retriever puppy',
    mode: PromptMode.Image,
    imageStyle: ImageStyle.Hyperrealistic,
    lighting: Lighting.SoftStudio,
    framing: Framing.TightShot,
    contentTone: ContentTone.Whimsical,
  },
  {
    title: 'Awkward 90’s Yearbook Photo',
    description: 'Generates a cheesy, awkward 1990s high school yearbook photo with a laser background.',
    prompt: 'a teenager with braces and a mullet',
    mode: PromptMode.Image,
    imageStyle: ImageStyle._35mmFilm,
    lighting: Lighting.HarshDirectFlash,
    framing: Framing.TightShot,
    cameraAngle: CameraAngle.Frontal,
    contentTone: ContentTone.Humorous,
  },
  // Video Templates
  {
    title: 'Cinematic Drone Shot',
    description: 'A sweeping, epic drone shot revealing a dramatic landscape.',
    prompt: 'mist-covered mountain range at sunrise with ancient ruins',
    mode: PromptMode.Video,
    pov: PointOfView.Aerial,
    resolution: CameraResolution.EightK,
    contentTone: ContentTone.Adventurous,
  },
  {
    title: 'Tense Action Scene',
    description: 'A short, fast-paced action sequence with a suspenseful tone.',
    prompt: 'running through a narrow, rain-soaked alley at night',
    mode: PromptMode.Video,
    pov: PointOfView.FirstPerson,
    contentTone: ContentTone.Tension,
    resolution: CameraResolution.HD,
  },
  {
    title: 'Whimsical Character Intro',
    description: 'A charming introduction to a magical, whimsical character.',
    prompt: 'a tiny, glowing fairy asleep inside a flower that is slowly blooming',
    mode: PromptMode.Video,
    pov: PointOfView.Dolly,
    contentTone: ContentTone.Whimsical,
    resolution: CameraResolution.FourK,
  },
];
