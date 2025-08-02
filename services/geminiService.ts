import { GoogleGenAI, Type } from "@google/genai";
import { OutputStructure, PromptMode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

function buildSystemInstruction(mode: string, options: Record<string, any>): string {
    let instruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model. The generated prompt should be a masterpiece of clarity and descriptive power.`;

    if (options.outputStructure === OutputStructure.Paragraph) {
        instruction += ` Do not add any conversational text, prefixes, or explanations. Only output the final prompt.`;
    }

    let modeInstruction = '';
    let paramsToIncorporate = '';

    const addParam = (label: string, value: any) => {
        if (value) {
            paramsToIncorporate += `- ${label}: ${value}\n`;
        }
    };

    switch (mode) {
        case PromptMode.Image:
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
        case PromptMode.Video:
            modeInstruction = `The target model is a state-of-the-art AI video generator. Describe a continuous scene, focusing on motion, atmosphere, and visual storytelling.`;
            addParam('Tone', options.contentTone);
            addParam('Point of View', options.pov);
            addParam('Detail Level', options.resolution);
            break;
        case PromptMode.Text:
            modeInstruction = `The target is a large language model. Your goal is to refine the user's request into a crystal-clear and effective prompt for generating text.`;
            addParam('Tone of Voice', options.contentTone);
            addParam('Desired Output Format', options.outputFormat);
            break;
        case PromptMode.Audio:
            modeInstruction = `The target model is an AI audio/music generator. Describe the sound in detail, including instrumentation, tempo, and emotional feeling.`;
            addParam('Audio Type', options.audioType);
            addParam('Vibe/Mood', options.audioVibe);
            addParam('Overall Tone', options.contentTone);
            break;
        case PromptMode.Code:
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

export async function getEnhancedPrompt({
    userPrompt,
    mode,
    options
}: {
    userPrompt: string;
    mode: string;
    options: Record<string, any>;
}): Promise<ReadableStream<Uint8Array>> {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`GEMINI_API_KEY loaded: ${apiKey ? 'Yes' : 'No'}`);
    if (!apiKey) {
        throw new Error('The GEMINI_API_KEY environment variable is not set.');
    }

    const systemInstruction = buildSystemInstruction(mode, options);
    const isSimpleJson = options.outputStructure === OutputStructure.SimpleJSON;
    const isDetailedJson = options.outputStructure === OutputStructure.DetailedJSON;

    const generationConfig: any = {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
    };

    if (isSimpleJson || isDetailedJson) {
        generationConfig.responseMimeType = "application/json";
        generationConfig.responseSchema = isSimpleJson ? schemas.simple : schemas.detailed;
    }

    const model = ai.getGenerativeModel({
        model: options.model || 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
    });

    try {
        const result = await model.generateContentStream({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: generationConfig,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });

        return stream;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error('The API key is invalid. Please check your configuration.');
            }
            if (isSimpleJson || isDetailedJson) {
                throw new Error(`The model failed to return the expected structured data. Please try adjusting your prompt or modifiers. Details: ${error.message}`);
            }
            throw new Error(`Gemini API error: ${error.message}`);
        }
        throw new Error("An unknown error occurred with the Gemini API.");
    }
}
