// src/services/geminiService.ts

import { OutputStructure, PromptMode } from '../types'; 

export type EnhancePromptOptions = {
  userPrompt: string;
  mode: PromptMode;
  options: Record<string, any>;
  outputStructure?: OutputStructure;
};

export async function getEnhancedPrompt({
  userPrompt,
  mode,
  options,
  outputStructure = OutputStructure.Plain,  // default to plain-text
}: EnhancePromptOptions) {
  try {
    const apiUrl = '/api/gemini-non-stream';
    
    const payload = {
      userPrompt,
      mode,
      options,
      outputStructure,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // you can keep your existing auth header or switch to BE-handled key
        'Authorization': import.meta.env.VITE_CLIENT_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const details = errorData.details || response.statusText;
      const cause = errorData.cause;
      const errorMessage = `API Error: ${details}`;
      const err = new Error(errorMessage);
      if (cause) (err as any).cause = cause;
      throw err;
    }

    // The server now returns either:
    // { prompt: string } 
    // or, if outputStructure===JSON:
    // { prompt: string, parameters: { mode: string; ... } }
    const data = await response.json();

    // If they asked for JSON, just return the full object:
    if (outputStructure === OutputStructure.JSON) {
      return data as { prompt: string; parameters: Record<string, any> };
    }

    // Otherwise return the raw prompt string:
    return (data as { prompt: string }).prompt;

  } catch (error) {
    if (error instanceof Error) {
      // preserve cause if present
      if ((error as any).cause) throw error;
      throw new Error(`Failed to fetch prompt enhancement: ${error.message}`);
    }
    throw new Error('An unknown error occurred during the enhancement process.');
  }
}
