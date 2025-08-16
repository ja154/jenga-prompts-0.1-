import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Vercel API route for streaming Gemini responses
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
        console.log('Received request for streaming enhancement.');
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
        console.error('Error in streaming enhancement:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to generate content',
                details: error.message 
            });
        } else if (!res.writableEnded) {
            res.write(`\n\nError: ${error.message}`);
            res.end();
        }
    }
}

function buildSystemInstruction(mode, options) {
    let baseInstruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model. The generated prompt should be a masterpiece of clarity and descriptive power.`;
    
    if (options.outputStructure === 'Descriptive Paragraph') {
       baseInstruction += ` Do not add any conversational text, prefixes, or explanations. Only output the final prompt.`;
    }

    let modeInstruction = '';
    let paramsToIncorporate = '';

    const addParam = (label, value) => {
        if (value) {
            paramsToIncorporate += `- **${label}**: ${value}\n`;
        }
    };

    // Load the appropriate framework content from the markdown file
    try {
        const frameworkFile = mode === 'Image' ? 'image-prompt-framework.md' :
                              mode === 'Video' ? 'video-prompt-framework.md' : '';
        if (frameworkFile) {
            const frameworkPath = path.join(process.cwd(), 'src', frameworkFile);
            modeInstruction = fs.readFileSync(frameworkPath, 'utf-8');
        } else {
            // Fallback for other modes
            modeInstruction = `Generate a high-quality prompt for the ${mode} modality.`;
        }
    } catch (error) {
        console.error(`Error reading ${mode} prompt framework:`, error);
        modeInstruction = `Generate a high-quality prompt for the ${mode} modality.`;
    }

    // Collect all relevant parameters
    switch (mode) {
        case 'Image':
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
            addParam('Tone', options.contentTone);
            addParam('Point of View', options.pov);
            addParam('Detail Level', options.resolution);
            break;
        case 'Text':
            addParam('Tone of Voice', options.contentTone);
            addParam('Desired Output Format', options.outputFormat);
            break;
        case 'Audio':
            addParam('Audio Type', options.audioType);
            addParam('Vibe/Mood', options.audioVibe);
            addParam('Overall Tone', options.contentTone);
            break;
        case 'Code':
            addParam('Language', options.codeLanguage);
            addParam('Task', options.codeTask);
            break;
    }

    let finalSystemInstruction = `${baseInstruction}\n\n### Framework and Task\n${modeInstruction}`;

    // If there are parameters, inject them into the framework before the final task description
    if (paramsToIncorporate) {
        const guidance = `
---
## GUIDANCE & CONSTRAINTS

Before you begin, you must integrate the following user-defined parameters into your creative process. These are not optional. Weave them naturally into the final prompt you generate.

### Core Parameters
${paramsToIncorporate}
---
`;
        const taskMarker = "## FINAL PROMPT GENERATION TASK";
        finalSystemInstruction = finalSystemInstruction.replace(taskMarker, `${guidance}\n${taskMarker}`);
    }

    return finalSystemInstruction;
}
