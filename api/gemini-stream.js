import { GoogleGenAI } from "@google/genai";

// Vercel API route for streaming Gemini responses
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

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        const ai = new GoogleGenAI({ apiKey });

        // Build system instruction based on mode and options
        const systemInstruction = buildSystemInstruction(mode, options);
        
        const config = {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
        };

        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: config
        });

        // Stream the response
        for await (const chunk of response.stream) {
            const text = chunk.text();
            if (text) {
                res.write(text);
            }
        }

        res.end();

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to generate content',
                details: error.message 
            });
        } else {
            res.write(`\n\nError: ${error.message}`);
            res.end();
        }
    }
}

function buildSystemInstruction(mode, options) {
    let instruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model. The generated prompt should be a masterpiece of clarity and descriptive power.`;
    
    if (options.outputStructure === 'Descriptive Paragraph') {
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
