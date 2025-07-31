import { EnhancedPromptResult } from '../types';

export async function getEnhancedPrompt({
  userPrompt,
  mode,
  options
}: {
  userPrompt: string;
  mode: string;
  options: Record<string, any>;
}): Promise<EnhancedPromptResult> {
  const res = await fetch('/api/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt, mode, options }),
  });

  let body: any;
  try {
    body = await res.json();
  } catch (err) {
    const text = await res.text();
    throw new Error(`Non-JSON response: ${text}`);
  }

  if (!res.ok || !body?.success) {
    throw new Error(body?.error || 'An error occurred while enhancing the prompt.');
  }

  return body.data;
}
