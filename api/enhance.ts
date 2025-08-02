

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnhancedPrompt } from '../services/geminiService';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body: any = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(JSON.parse(data)));
      req.on('error', reject);
    });

    const { userPrompt, mode, options } = body;

    // Detailed logging for incoming requests
    console.log('Received /api/enhance request:', {
      userPrompt,
      mode,
      options,
      ip: req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });

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
    const message = error.message || 'An unknown server error occurred.';

    // If headers are already sent, we must send the error through the stream
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    } else {
      // If headers are not sent, we can send a proper HTTP error response
      res.status(500).json({ error: message });
    }
  }
}
