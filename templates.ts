import { PromptMode } from './types';

export interface PromptTemplate {
  title: string;
  description: string;
  prompt: string;
  mode: PromptMode;
}

export const templates: PromptTemplate[] = [
  // Image Templates
  {
    title: 'Realistic Polaroid Photo',
    description: 'Create a realistic polaroid photo of anything.',
    prompt: 'Create a full, realistic Polaroid photograph of [prompt_input placeholder="a subject, e.g., a cat sleeping on a bookshelf"]. If a reference photo is provided, use it for the subject. The final image must show the full polaroid, centered in the frame. The photo itself should look like a careless, unintentional snapshot with awkward, off-kilter framing and a mediocre composition. Include motion blur and harsh overexposure from an on-camera flash. Lighting should be uneven, with blown-out highlights and deep shadows. The image should feel aggressively amateur, as if taken by accident. Apply visible Polaroid film texture, soft film grain, and a subtle vintage tint. Show the classic white Polaroid border completely, including the wider bottom strip. On the bottom strip, add scribbled handwriting in pen that says: "[prompt_input placeholder="text for the bottom, e.g., Summer \'98"]". The handwriting should appear messy and rushed. Add faint smudges, slight bends, or dirt marks on the white frame to enhance realism. Do not crop the Polaroid—the full photo and its border must be visible.',
    mode: PromptMode.Image,
  },
  {
    title: 'Classic Disney Character',
    description: 'Turn yourself (or an idea) into a classic Disney character.',
    prompt: 'Create a character drawn in the Disney Classic animation style of the mid-20th century, based on [prompt_input placeholder="a description of the character"]. If a photo is uploaded, use it for the likeness. The final image should feel like a frame from an original hand-inked and painted cel animation. Style and visual elements: Face and expression: Large, soft eyes with dark pupils, gentle white highlights, and slight gloss to evoke emotion. Eyebrows are thin, arched, and expressive. Expression should be tender, curious, or slightly concerned—typical of classic Disney charm. Lines: Clean black ink outlines that vary in thickness (thicker on the outside edges, thinner on inner details), mimicking traditional cel animation inking. Color palette: Warm, naturalistic colors with subtle tonal variations. Use hand-painted-style gradients on the character to create gentle depth—no harsh shadows. Background: Painted-style background with watercolor texture or a pastel sky and ground surface. Overall tone: Wholesome, emotional, vintage Disney.',
    mode: PromptMode.Image,
  },
  {
    title: 'Your Home As A LEGO Set',
    description: 'Turn your home or any home into a LEGO playset.',
    prompt: 'Create an ultra-realistic LEGO play set product image of a house, based on [prompt_input placeholder="a description of the house"]. If a photo is uploaded, use it as the reference. The final image should perfectly mimic the look of official LEGO Creator Expert or LEGO Ideas box photography. The scene should feature two distinct elements: In the background, a realistic cardboard LEGO box standing upright, displaying a rendered image of the completed LEGO house. In the foreground, the completed real-world LEGO version of the house built from bricks. The LEGO box must include: The official LEGO logo, an age rating like “16+”, a fictional set number, and a large set name: "[prompt_input placeholder="name your LEGO set"]". Build the house with accurate proportions and key architectural features from the description or photo. Add the following LEGO minifigures in the foreground set: [prompt_input placeholder="list family members"]. Lighting should be soft and clean, matching official LEGO photography.',
    mode: PromptMode.Image,
  },
  {
    title: 'Beanie Baby',
    description: 'Turn yourself (or an idea) into a cute collectable Beanie Baby (with tag).',
    prompt: 'Create a Beanie Baby-style stuffed toy modeled after [prompt_input placeholder="a description of a person or animal"]. If a reference image is attached, base the toy on that subject instead. The plush should have the same general style, material, and proportions as a classic Beanie Baby. Use the subject’s hairstyle, skin tone, and unique features (like glasses) as inspiration for the plush toy’s design. The toy should be wearing [prompt_input placeholder="a gray hoodie or other clothing"]. The texture should be soft, velvety, and stuffed. The eyes should be simple black beads. The background should be plain white. Include a red heart-shaped Ty tag on the toy\'s ear to match the iconic style. Make the overall look cute, simple, and collectible, just like a 1990s Beanie Baby.',
    mode: PromptMode.Image,
  },
  {
    title: 'Awkward 90’s Yearbook Photo',
    description: 'Turn anyone (or an idea) into an awkward 90’s yearbook photo.',
    prompt: 'Create a fake high school yearbook portrait from the late 1990s of [prompt_input placeholder="a description of a person"]. If a photo is uploaded, transform that person instead. The final image should show a younger version of the subject—approximately 15 to 17 years old. If using an uploaded photo, the face must still clearly match the person\'s identity, but be realistically aged down. Pose the younger version of the subject awkwardly, with a forced closed-mouth grin. Add an iconic laser background with neon blue and pink diagonal streaks, paired with soft, flat school portrait lighting and a slight red-eye effect. Outfit the teen version in 90s school photo fashion. Add visible metal braces across the teeth. Overlay the image with a bold name caption in all caps "[prompt_input placeholder="person\'s name"]" and a cheesy or embarrassing quote like: "[prompt_input placeholder="yearbook quote"]".',
    mode: PromptMode.Image,
  },
  // Video Templates
  {
    title: 'Cinematic Drone Shot',
    description: 'A sweeping, epic drone shot revealing a dramatic landscape.',
    prompt: 'A breathtaking, ultra-wide drone shot, slowly pushing forward over a mist-covered mountain range at sunrise. The golden light catches the peaks, revealing ancient, moss-covered ruins. The mood is adventurous and awe-inspiring, with a sense of discovery. The video quality is hyper-detailed 8K, capturing every leaf and rock texture.',
    mode: PromptMode.Video,
  },
  {
    title: 'Tense Action Scene',
    description: 'A short, fast-paced action sequence with a suspenseful tone.',
    prompt: 'A frantic, shaky-cam first-person POV shot. The character is running through a dimly lit, narrow alleyway at night. Rain is pouring down, reflecting the flashing neon signs from the main street. The sound of heavy footsteps echoes close behind. The scene is full of tension and suspense, ending abruptly as the character glances over their shoulder.',
    mode: PromptMode.Video,
  },
  {
    title: 'Whimsical Character Intro',
    description: 'A charming introduction to a magical, whimsical character.',
    prompt: 'A static, dolly zoom shot of a tiny, glowing fairy asleep inside a dew-covered flower. The camera slowly pushes in as the flower petals gently unfold, waking the fairy. She yawns, stretches her sparkling wings, and dusts magical pollen into the air. The atmosphere is whimsical and magical, with a soft, dreamy focus and pastel colors.',
    mode: PromptMode.Video,
  },
];