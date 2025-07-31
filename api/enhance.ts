import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { OutputStructure, PromptMode } from '../types.js';

// The API key is now securely on the server.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This function is copied from the original geminiService.ts
function buildSystemInstruction(mode: string, options: Record<string, any>): string {
    let instruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model. The generated prompt should be a masterpiece of clarity and descriptive power. Do not add any conversational text, prefixes, or explanations. Only output the final prompt in the requested format.`;

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

    if (options.outputStructure === OutputStructure.DetailedJSON) {
        instruction += `\n\n### Output Format\nCRITICAL: The final output must be a single JSON object with three keys: "basePrompt", "modifiers", and "fullPrompt".\n1. "basePrompt": Must contain the original user's core idea.\n2. "modifiers": An object containing the specific parameter values provided for this generation. Only include keys for parameters that were provided by the user.\n3. "fullPrompt": A single, descriptive paragraph that masterfully weaves together the base prompt and all provided modifiers into the final, usable prompt. This should be the same text as if you were generating a paragraph-only prompt.`;
    } else if (options.outputStructure === OutputStructure.SimpleJSON) {
        instruction += `\n\n### Output Format\nCRITICAL: The final output must be a single JSON object. This object should contain one key, "prompt", whose value is the expertly crafted prompt string. Example: {"prompt": "An expertly crafted prompt..."}`;
    } else {
        instruction += `\n\n### Output Format\nCRITICAL: The final output must be ONLY the text of the enhanced prompt itself. Do not include any titles, markdown, or conversational filler.`;
    }

    return instruction;
}

// This function is the core logic, also from the original geminiService.ts
async function getEnhancedPromptInternal({
    userPrompt,
    mode,
    options
}: {
    userPrompt: string;
    mode: string;
    options: Record<string, any>;
}) {
    const systemInstruction = buildSystemInstruction(mode, options);
    const isSimpleJson = options.outputStructure === OutputStructure.SimpleJSON;
    const isDetailedJson = options.outputStructure === OutputStructure.DetailedJSON;

    const config: any = {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
    };

    if (isSimpleJson || isDetailedJson) {
        config.responseMimeType = "application/json";

        if (isSimpleJson) {
            config.responseSchema = {
                type: Type.OBJECT,
                properties: {
                    prompt: { 
                        type: Type.STRING,
                        description: "The expertly crafted prompt string."
                    },
                },
                required: ['prompt'],
            };
        } else { // isDetailedJson
            let modifierProperties: Record<string, any> = {};
            switch (mode) {
                case PromptMode.Image:
                    modifierProperties = {
                        contentTone: { type: Type.STRING },
                        imageStyle: { type: Type.STRING },
                        lighting: { type: Type.STRING },
                        framing: { type: Type.STRING },
                        cameraAngle: { type: Type.STRING },
                        resolution: { type: Type.STRING },
                        aspectRatio: { type: Type.STRING },
                        additionalDetails: { type: Type.STRING },
                    };
                    break;
                case PromptMode.Video:
                    modifierProperties = {
                        contentTone: { type: Type.STRING },
                        pov: { type: Type.STRING },
                        resolution: { type: Type.STRING },
                    };
                    break;
                case PromptMode.Text:
                    modifierProperties = {
                        contentTone: { type: Type.STRING },
                        outputFormat: { type: Type.STRING },
                    };
                    break;
                case PromptMode.Audio:
                    modifierProperties = {
                        contentTone: { type: Type.STRING },
                        audioType: { type: Type.STRING },
                        audioVibe: { type: Type.STRING },
                    };
                    break;
                case PromptMode.Code:
                    modifierProperties = {
                        codeLanguage: { type: Type.STRING },
                        codeTask: { type: Type.STRING },
                    };
                    break;
            }
            
            config.responseSchema = {
                type: Type.OBJECT,
                properties: {
                    basePrompt: { type: Type.STRING, description: "The original user's core idea." },
                    modifiers: { 
                        type: Type.OBJECT,
                        properties: modifierProperties,
                    },
                    fullPrompt: { type: Type.STRING, description: "The final, masterfully woven prompt." }
                },
                required: ["basePrompt", "modifiers", "fullPrompt"]
            };
        }
    }


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: config
        });

        const rawText = response.text;
        let primaryResult: string;
        let jsonResult: string | undefined;

        if (isSimpleJson || isDetailedJson) {
            jsonResult = rawText;
            let textToParse = rawText.trim();
            // A more robust way to find JSON, even with leading/trailing characters
            const jsonMatch = textToParse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch) {
                textToParse = jsonMatch[0];
            }

            try {
                const parsedJson = JSON.parse(textToParse);
                primaryResult = isDetailedJson ? parsedJson.fullPrompt : parsedJson.prompt;
                if (!primaryResult) {
                    // Fallback if the expected key isn't there
                    primaryResult = textToParse;
                }
                jsonResult = JSON.stringify(parsedJson, null, 2);
            } catch (e) {
                console.error("Failed to parse JSON response. Raw text was:", rawText, "Error:", e);
                primaryResult = rawText; // Fallback to raw text on parsing error
            }
        } else {
            primaryResult = rawText;
            jsonResult = undefined;
        }

        return {
            primaryResult,
            jsonResult,
        };

    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error('The API key is invalid. Please check your configuration.');
            }
            throw new Error(`Gemini API error: ${error.message}`);
        }
        throw new Error("An unknown error occurred with the Gemini API.");
    }
}


// The Vercel handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userPrompt, mode, options } = req.body;
    
    if (!userPrompt || !mode || !options) {
        return res.status(400).json({ success: false, error: 'Missing required parameters: userPrompt, mode, options' });
    }

    const result = await getEnhancedPromptInternal({
      userPrompt,
      mode,
      options,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/enhance:', error);
    return res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
}
