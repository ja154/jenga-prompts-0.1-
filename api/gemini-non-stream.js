import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Vercel API route for non-streaming Gemini responses
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://jenga-prompts-0-1.vercel.app');
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

    const clientApiKey = req.headers.authorization;
    if (clientApiKey !== process.env.CLIENT_API_KEY) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        console.log('Received request for non-streaming enhancement.');
        const { userPrompt, mode, options } = req.body;

        if (!userPrompt) {
            res.status(400).json({ error: 'Missing userPrompt' });
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'API key not configured' });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        // Build system instruction based on mode and options
        const systemInstruction = buildSystemInstruction(mode, options, userPrompt);

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

        const rawText = response.response.candidates[0].content.parts[0].text;
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
                error.cause = { rawText: rawText };
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
        console.error('Error in non-streaming enhancement:', error);

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

function buildSystemInstruction(mode, options, userPrompt) {
    const frameworkPath = path.resolve(process.cwd(), 'api', 'prompt-framework.json');
    const framework = JSON.parse(fs.readFileSync(frameworkPath, 'utf-8'));

    const persona = framework.steps.find(step => step.name === "Persona Assignment").template;
    const modalityConfig = framework.steps.find(step => step.name === "Modality-Specific Task Definition").modalities[mode];

    if (!modalityConfig) {
        return "You are a helpful assistant."; // Fallback
    }

    let modalityInstruction = modalityConfig.goal;
    if (modalityConfig.directives_template) {
        const directives = modalityConfig.directives_template;
        for (const key in directives) {
            const placeholder = directives[key];
            const optionKey = placeholder.replace(/{{|}}/g, '');
            if (options[optionKey]) {
                directives[key] = options[optionKey];
            }
        }
        modalityInstruction += `\n\nDirectives:\n${JSON.stringify(directives, null, 2)}`;
    }

    if (modalityConfig.key_requirements) {
        modalityInstruction += `\n\nKey Requirements:\n- ${modalityConfig.key_requirements.join('\n- ')}`;
    }

    if (modalityConfig.output_format_instruction) {
        modalityInstruction += `\n\nOutput Format:\n${modalityConfig.output_format_instruction}`;
    }

    const userInputInjection = framework.steps.find(step => step.name === "User Input Injection").template.replace('{{userPrompt}}', userPrompt);

    return `${persona}\n\n${modalityInstruction}\n\n${userInputInjection}`;
}
