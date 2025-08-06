import { GoogleGenAI } from "@google/genai";

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

        // Build system instruction based on mode and options using the new logic
        const systemInstruction = buildSystemPrompt(mode, options);

        const finalUserPrompt = `Here is my core idea. Please generate the master prompt based on the instructions you have been given.\n\n**Core Idea:** "${userPrompt}"`;

        const config = {
            systemInstruction: {role: "system", parts: [{text: systemInstruction}]},
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
        };

        const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{role: "user", parts: [{text: finalUserPrompt}]}],
            ...config
        });

        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
            console.error('Invalid response from Gemini API:', JSON.stringify(result, null, 2));
            // Check for specific block reasons
            if (response && response.promptFeedback && response.promptFeedback.blockReason) {
                throw new Error(`Request was blocked by the API. Reason: ${response.promptFeedback.blockReason}`);
            }
            throw new Error('Invalid or empty response from Gemini API');
        }

        const rawText = response.candidates[0].content.parts[0].text;
        if (!rawText) {
            throw new Error('Empty response from Gemini API');
        }

        const enhancedPrompt = rawText.trim();

        if (options.outputStructure === 'JSON') {
            const jsonOutput = {
                prompt: enhancedPrompt,
                parameters: {
                    mode: mode,
                    ...options
                }
            };
            if ('additionalDetails'in jsonOutput.parameters && jsonOutput.parameters.additionalDetails === '') {
                delete jsonOutput.parameters.additionalDetails;
            }
            res.status(200).json(jsonOutput);
        } else {
            res.status(200).json({
                prompt: enhancedPrompt,
            });
        }

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

// New function to build the system prompt based on user's logic
const buildSystemPrompt = (mode, options) => {
    let basePrompt = `You are a world-class prompt engineer, a specialist in crafting detailed, effective prompts for AI models. Your task is to take a user's basic idea and transform it into a "master prompt" optimized for a specific modality.`;

    switch (mode) {
        case 'Video':
            return `${basePrompt}
            **Modality: Video Generation (e.g., Sora, Veo, Runway)**
            **Task:** Write a "master prompt" as a single, dense paragraph (150-250 words) that functions as a detailed screenplay shot description for an 8-second video. It must be evocative, precise, and describe a complete micro-narrative.
            **Directives:**
            - Content Tone: ${options.contentTone}
            - Point of View: ${options.pov}
            - Quality: ${options.resolution}
            - **Key Requirements:** Establish a narrative arc (beginning, middle, end). Be visually explicit about subjects, actions, environment, and cinematography. Define the atmosphere with powerful adjectives.
            **Output Format:** A single paragraph starting directly with the description. No introductory text or markdown.`;

        case 'Image':
            return `${basePrompt}
            **Modality: Image Generation (e.g., Imagen, Midjourney, DALL-E)**
            **Task:** Transform the user's concept into an extremely dense, comma-separated list of keywords and phrases. The prompt should be rich in technical and artistic terms.
            **Directives:**
            - Style: ${options.imageStyle}
            - Tone & Mood: ${options.contentTone}
            - Lighting: ${options.lighting}
            - Framing: ${options.framing}
            - Camera Angle: ${options.cameraAngle}
            - Quality: ${options.resolution}
            - Aspect Ratio: ${options.aspectRatio}
            - Additional Details: "${options.additionalDetails}"
            **Key Requirements:** Use descriptive keywords, not full sentences. Incorporate professional terminology from photography and art.
            **Output Format:** A single, comma-separated string of keywords. No preamble, explanation, or markdown.`;

        case 'Text':
             return `${basePrompt}
            **Modality: Text Generation (Large Language Models, e.g., Gemini, GPT-4)**
            **Task:** Refine the user's prompt to be more specific, structured, and effective for an LLM. Clarify intent, add constraints, and define the desired output format.
            **Directives:**
            - Tone: ${options.contentTone}
            - Desired Output Format: ${options.outputFormat}
            **Key Requirements:** Enhance the original prompt by adding context, specifying a persona for the AI, providing examples (if applicable), and setting clear boundaries to prevent vague responses.
            **Output Format:** The complete, enhanced text prompt, ready to be used.`;

        case 'Audio':
            return `${basePrompt}
            **Modality: Audio Generation (e.g., Suno, ElevenLabs)**
            **Task:** Create a rich, descriptive prompt for generating audio. This could be for music, speech, or sound effects.
            **Directives:**
            - Audio Type: ${options.audioType}
            - Vibe / Mood: ${options.audioVibe}
            - Tone: ${options.contentTone}
            **Key Requirements:** If music, describe genre, tempo, instrumentation, and vocals. If speech, describe the speaker's voice, emotion, and pacing. If SFX, describe the sound's characteristics and environment.
            **Output Format:** A descriptive paragraph tailored for an audio generation model.`;

        case 'Code':
            return `${basePrompt}
            **Modality: Code Generation (e.g., Copilot, CodeWhisperer)**
            **Task:** Convert a natural language request into a precise and clear instruction for a code generation model.
            **Directives:**
            - Programming Language: ${options.codeLanguage}
            - Task: ${options.codeTask}
            **Key Requirements:** Be unambiguous. Specify function names, parameters, expected return values, and logic. If debugging, provide the broken code and describe the error. If refactoring, state the goals (e.g., improve performance, readability).
            **Output Format:** A well-commented, clear, and actionable prompt for a code generation AI.`;

        default:
            return 'You are a helpful assistant.';
    }
};
