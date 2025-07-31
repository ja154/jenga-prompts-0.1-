// /api/enhance.ts or /app/api/enhance/route.ts
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

const GEMINI_PROXY_URL = 'https://YOUR_CLOUD_RUN_URL_HERE'; // Replace with your full Cloud Run proxy URL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const proxyRes = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: body.userPrompt }]
          }
        ],
        ...body.options // pass through other config if needed
      }),
    });

    const proxyText = await proxyRes.text();

    let proxyData: any;
    try {
      proxyData = JSON.parse(proxyText);
    } catch {
      throw new Error(`Gemini returned non-JSON: ${proxyText}`);
    }

    if (!proxyRes.ok) {
      throw new Error(proxyData.error?.message || 'Gemini API returned error');
    }

    return new Response(JSON.stringify({
      success: true,
      data: proxyData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
