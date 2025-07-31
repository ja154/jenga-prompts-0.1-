// /api/enhance.ts
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

const GEMINI_PROXY_URL = 'https://jengaprompts-pro-197311920382.us-west1.run.app/api-proxy/v1beta/models/gemini-2.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userPrompt } = body;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ]
    };

    const geminiRes = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    const geminiText = await geminiRes.text();

    let geminiData: any;
    try {
      geminiData = JSON.parse(geminiText);
    } catch {
      throw new Error(`Gemini response is not valid JSON: ${geminiText}`);
    }

    if (!geminiRes.ok) {
      throw new Error(geminiData?.error?.message || 'Gemini API error');
    }

    return new Response(JSON.stringify({
      success: true,
      data: geminiData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
