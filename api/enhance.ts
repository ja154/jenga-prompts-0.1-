

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnhancedPrompt } from '../services/geminiService';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userPrompt, mode, options } = await req.json();

    if (!userPrompt || !mode || !options) {
      res.status(400).json({ error: 'Missing required parameters: userPrompt, mode, options' });
      return;
    }

    const stream = await getEnhancedPrompt({
      userPrompt,
      mode,
      options,
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.status(200);

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        const chunk = decoder.decode(value, { stream: true });
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.end();

  } catch (error: any) {
    console.error('Error in /api/enhance:', error);
    const message = error.message || 'An unknown error occurred.';
    // We can't set status code here because headers might already be sent.
    // We can, however, send a final error message in the stream.
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}
