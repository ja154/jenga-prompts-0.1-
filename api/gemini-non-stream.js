import { GoogleGenAI } from "@google/genai";
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

        // Build the system instruction
        const systemInstruction = buildSystemInstruction(mode, options);

        const isSimpleJson = options.outputStructure === 'Simple JSON';
        const isDetailedJson = options.outputStructure === 'Detailed JSON';

        const request = {
            model: 'gemini-1.5-flash',
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            }
        };

        const result = await ai.models.generateContent(request);

        if (!result || !result.candidates || result.candidates.length === 0) {
            console.error('Invalid response from Gemini API:', JSON.stringify(result, null, 2));
            if (result.promptFeedback && result.promptFeedback.blockReason) {
                throw new Error(`Request was blocked by the API. Reason: ${result.promptFeedback.blockReason}`);
            }
            throw new Error('Invalid or empty response from Gemini API');
        }

        const rawText = result.candidates[0].content.parts[0].text;
        if (!rawText) {
            throw new Error('Empty response from Gemini API');
        }

        const enhancedPrompt = rawText.trim();

        if (isSimpleJson) {
            res.status(200).json({ prompt: enhancedPrompt });
        } else if (isDetailedJson) {
            // For detailed JSON, we might want to extract more than just the prompt in the future.
            // For now, we return the prompt and the parameters used.
            const jsonOutput = {
                prompt: enhancedPrompt,
                parameters: { mode, ...options }
            };
            if ('additionalDetails' in jsonOutput.parameters && jsonOutput.parameters.additionalDetails === '') {
                delete jsonOutput.parameters.additionalDetails;
            }
            res.status(200).json(jsonOutput);
        } else {
            // Default to returning the text directly if not a specific JSON format
            res.setHeader('Content-Type', 'text/plain');
            res.status(200).send(enhancedPrompt);
        }

    } catch (error) {
        console.error('Error in non-streaming enhancement:', error);
        const responseError = {
            error: 'Failed to generate content',
            details: error.message,
        };
        if (error.cause) {
            responseError.cause = error.cause;
        }
        res.status(500).json(responseError);
    }
}

// This function is now aligned with the streaming API's version
function buildSystemInstruction(mode, options) {
    let baseInstruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model. The generated prompt should be a masterpiece of clarity and descriptive power.`;

    // This condition might need adjustment based on how JSON outputs are handled.
    // If JSON output is requested, we assume the final output should still be a clean prompt *inside* the JSON.
    if (options.outputStructure === 'Descriptive Paragraph' || options.outputStructure === 'Detailed JSON' || options.outputStructure === 'Simple JSON') {
       baseInstruction += ` Do not add any conversational text, prefixes, or explanations. Only output the final prompt itself.`;
    }

    let modeInstruction = '';
    let paramsToIncorporate = '';

    const addParam = (label, value) => {
        if (value) {
            paramsToIncorporate += `- **${label}**: ${value}\n`;
        }
    };

    try {
        const frameworkFile = mode === 'Image' ? 'image-prompt-framework.md' :
                              mode === 'Video' ? 'video-prompt-framework.md' : '';
        if (frameworkFile) {
            const frameworkPath = path.join(process.cwd(), 'src', frameworkFile);
            modeInstruction = fs.readFileSync(frameworkPath, 'utf-8');
        } else {
            modeInstruction = `Generate a high-quality prompt for the ${mode} modality.`;
        }
    } catch (error) {
        console.error(`Error reading ${mode} prompt framework:`, error);
        modeInstruction = `Generate a high-quality prompt for the ${mode} modality.`;
    }

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