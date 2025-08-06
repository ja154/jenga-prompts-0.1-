import { GoogleGenAI, Type } from "@google/genai";

// Vercel API route for non-streaming Gemini responses
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { userPrompt, mode, options } = req.body;

        if (!userPrompt) {
            res.status(400).json({ error: 'Missing userPrompt' });
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'API key not configured' });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        // Build system instruction based on mode and options
        const systemInstruction = buildSystemInstruction(mode, options);

        const isSimpleJson = options.outputStructure === 'SimpleJSON';
        const isDetailedJson = options.outputStructure === 'DetailedJSON';

        const config = {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
        };

        if (isSimpleJson || isDetailedJson) {
            config.responseMimeType = "application/json";
            config.responseSchema = isSimpleJson ? schemas.simple : schemas.detailed;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: config
        });

        const rawText = response.text;
        if (!rawText) {
            throw new Error('Empty response from Gemini API');
        }

        let primaryResult;
        let jsonResult;

        if (isSimpleJson || isDetailedJson) {
            try {
                const parsedJson = JSON.parse(rawText);
                primaryResult = isDetailedJson ? parsedJson.fullPrompt : parsedJson.prompt;
                if (typeof primaryResult !== 'string' || !primaryResult.trim()) {
                     throw new Error("The model's JSON response is missing the required prompt content.");
                }
                jsonResult = JSON.stringify(parsedJson, null, 2);
            } catch (e) {
                const error = new Error(`The model returned invalid JSON. See raw output for details. Parser error: ${e instanceof Error ? e.message : 'unknown'}`);
                error.cause = { rawText };
                throw error;
            }
        } else {
            primaryResult = rawText;
            jsonResult = undefined;
        }

        res.status(200).json({
            primaryResult,
            jsonResult,
        });

    } catch (error) {
        console.error('Gemini API Error:', error);

        const responseError = {
            error: 'Failed to generate content',
            details: error.message,
        }
        if (error.cause) {
            responseError.cause = error.cause;
        }

        res.status(500).json(responseError);
    }
}

const allModifierProperties = {
    contentTone: { type: Type.STRING, description: "The tone/mood of the content." },
    pov: { type: Type.STRING, description: "Point of view for video." },
    resolution: { type: Type.STRING, description: "Resolution or detail level." },
    imageStyle: { type: Type.STRING, description: "Artistic style for the image." },
    lighting: { type: Type.STRING, description: "Lighting style for the image." },
    framing: { type: Type.STRING, description: "Framing of the image shot." },
    cameraAngle: { type: Type.STRING, description: "Camera angle for the image." },
    aspectRatio: { type: Type.STRING, description: "Aspect ratio for the image." },
    additionalDetails: { type: Type.STRING, description: "Any other specific details." },
    outputFormat: { type: Type.STRING, description: "Format for text output." },
    audioType: { type: Type.STRING, description: "Type of audio to generate." },
    audioVibe: { type: Type.STRING, description: "Vibe/mood for the audio." },
    codeLanguage: { type: Type.STRING, description: "Programming language for the code task." },
    codeTask: { type: Type.STRING, description: "The task to perform on the code." },
};

const schemas = {
    simple: {
        type: Type.OBJECT,
        properties: {
            prompt: { type: Type.STRING, description: "The expertly crafted prompt." }
        },
        required: ['prompt']
    },
    detailed: {
        type: Type.OBJECT,
        properties: {
            basePrompt: {
                type: Type.STRING,
                description: "The original user's core idea."
            },
            modifiers: {
                type: Type.OBJECT,
                properties: allModifierProperties,
            },
            fullPrompt: {
                type: Type.STRING,
                description: "The final, usable prompt weaving together the base prompt and modifiers."
            }
        },
        required: ['basePrompt', 'fullPrompt', 'modifiers']
    }
};

function buildSystemInstruction(mode, options) {
    let instruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model. The generated prompt should be a masterpiece of clarity and descriptive power.`;

    if (options.outputStructure === 'Paragraph') {
       instruction += ` Do not add any conversational text, prefixes, or explanations. Only output the final prompt.`;
    }

    let modeInstruction = '';
    let paramsToIncorporate = '';

    const addParam = (label, value) => {
        if (value) {
            paramsToIncorporate += `- ${label}: ${value}\n`;
        }
    };

    switch (mode) {
        case 'Image':
            modeInstruction = `The target model is a state-of-the-art AI image generator. Weave the following parameters into a fluid, descriptive paragraph. Do not just list them. The prompt should paint a vivid picture for the AI.`;
            addParam('Style', options.imageStyle);
            addParam('Mood/Tone', options.contentTone);
            addParam('Lighting', options.lighting);
            addParam('Framing', options.framing);
            addParam('Camera Angle', options.cameraAngle);
            addParam('Detail Level', options.resolution);
            addParam('Aspect Ratio', options.aspectRatio);
            addParam('Additional Specifics', options.additionalDetails);
            break;
        case 'Video':
            modeInstruction = `The target model is a state-of-the-art AI video generator. Describe a continuous scene, focusing on motion, atmosphere, and visual storytelling.`;
            addParam('Tone', options.contentTone);
            addParam('Point of View', options.pov);
            addParam('Detail Level', options.resolution);
            break;
        case 'Text':
            modeInstruction = `The target is a large language model. Your goal is to refine the user's request into a crystal-clear and effective prompt for generating text.`;
            addParam('Tone of Voice', options.contentTone);
            addParam('Desired Output Format', options.outputFormat);
            break;
        case 'Audio':
            modeInstruction = `The target model is an AI audio/music generator. Describe the sound in detail, including instrumentation, tempo, and emotional feeling.`;
            addParam('Audio Type', options.audioType);
            addParam('Vibe/Mood', options.audioVibe);
            addParam('Overall Tone', options.contentTone);
            break;
        case 'Code':
            modeInstruction = `The target model is a code generation AI. Create a precise and unambiguous prompt to accomplish the user's technical task. The prompt must provide sufficient context for the AI to generate, debug, or explain code correctly.`;
            addParam('Language', options.codeLanguage);
            addParam('Task', options.codeTask);
            break;
        default:
            modeInstruction = `Generate a general-purpose, high-quality prompt.`;
            break;
    }

    instruction += `\n\n### Task\n${modeInstruction}`;
    if (paramsToIncorporate) {
        instruction += `\n\n### Parameters to Incorporate\n${paramsToIncorporate}`;
    }

    return instruction;
}
