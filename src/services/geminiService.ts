import { GoogleGenAI } from "@google/genai";
import { PromptMode, OutputStructure } from '../../types'; // Adjust path as needed
import { buildSystemPrompt } from '../../utils/promptBuilder'; // Extracted for reuse

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userPrompt, mode, options, outputStructure = OutputStructure.Plain } = req.body;

  try {
    if (!process.env.API_KEY) {
      throw new Error("API key is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Build system and user prompts
    const systemPrompt = buildSystemPrompt(mode, options);

    const finalUserPrompt = `Here is my core idea. Please generate the master prompt based on the instructions you have been given.

**Core Idea:** "${userPrompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalUserPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text?.trim();

    if (!text) {
      return res.status(500).json({ error: 'AI returned empty response.' });
    }

    // If outputStructure === JSON, wrap response
    if (outputStructure === OutputStructure.JSON) {
      const jsonOutput = {
        prompt: text,
        parameters: {
          mode,
          ...options,
        },
      };

      // Optional: clean up empty fields
      if ('additionalDetails' in jsonOutput.parameters && jsonOutput.parameters.additionalDetails === '') {
        delete jsonOutput.parameters.additionalDetails;
      }

      return res.status(200).json(jsonOutput);
    }

    // Return raw prompt
    return res.status(200).json({ prompt: text });

  } catch (error) {
    console.error('Gemini Non-Stream Error:', error);
    return res.status(500).json({
      error: 'Failed to enhance prompt',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
