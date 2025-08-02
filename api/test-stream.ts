import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
};

// A helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.status(200);

  try {
    for (let i = 1; i <= 5; i++) {
      const chunk = `Test chunk ${i}... `;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      await sleep(1000); // Wait for 1 second
    }
    res.write(`data: ${JSON.stringify({ chunk: "Stream complete!" })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in /api/test-stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred on the test stream.' });
    }
    res.end();
  }
}
