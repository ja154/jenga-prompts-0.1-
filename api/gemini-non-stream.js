import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Load the prompt framework
const frameworkPath = path.join(process.cwd(), 'prompt-framework.json');
const promptFramework = JSON.parse(fs.readFileSync(frameworkPath, 'utf-8'));

// Vercel API route for non-streaming Gemini responses
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
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
        const { userPrompt, mode, options } = req.body;

        if (!userPrompt || !mode) {
            res.status(400).json({ error: 'Missing userPrompt or mode' });
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'API key not configured' });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        const { systemInstruction, userInstruction } = buildPromptFromFramework(mode, options, userPrompt);

        const request = {
            model: 'gemini-1.5-flash',
            contents: [{ role: "user", parts: [{ text: userInstruction }] }],
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                responseMimeType: "application/json", // Instruct the model to return JSON
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

        // The response should be a JSON string, so we parse it.
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(rawText.trim());
        } catch (parseError) {
            console.error('Failed to parse JSON response from AI:', rawText);
            throw new Error(`AI returned invalid JSON. Response: "${rawText.substring(0, 100)}..."`);
        }

        res.status(200).json(jsonResponse);

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

const buildPromptFromFramework = (mode, options, userPrompt) => {
    const personaStep = promptFramework.steps.find(step => step.name === "Persona Assignment");
    const modalityStep = promptFramework.steps.find(step => step.name === "Modality-Specific Task Definition");
    const userInputStep = promptFramework.steps.find(step => step.name === "User Input Injection");

    if (!personaStep || !modalityStep || !userInputStep) {
        throw new Error("Required steps not found in prompt-framework.json");
    }

    const modalityConfig = modalityStep.modalities[mode];
    if (!modalityConfig) {
        throw new Error(`Modality '${mode}' not found in prompt-framework.json`);
    }

    // --- Build System Instruction ---
    let systemInstruction = personaStep.template;

    // Replace placeholders in the goal template
    let goal = modalityConfig.goal;
    for (const key in options) {
        if (goal.includes(`{{${key}}}`)) {
            goal = goal.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), options[key]);
        }
    }
    systemInstruction += "\n\n" + goal;
    systemInstruction += "\n\nIMPORTANT: Your entire response must be a single, raw JSON object. Do not include any text, explanation, or markdown formatting before or after the JSON object.";

    // --- Build User Instruction ---
    let userInstruction = userInputStep.template.replace('{{userPrompt}}', userPrompt);

    // Append directives if they exist
    if (modalityConfig.directives_template) {
        let directives = "\n\n**Directives:**";
        const template = modalityConfig.directives_template;
        let directivesAdded = false;
        for (const key in template) {
            const placeholder = template[key].replace(/[{}]/g, '');
            if (options[placeholder] && options[placeholder] !== 'Default') {
                directives += `\n- ${key}: ${options[placeholder]}`;
                directivesAdded = true;
            }
        }
        if (directivesAdded) {
            userInstruction += directives;
        }
    }

    return { systemInstruction, userInstruction };
};