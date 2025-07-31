import { EnhancedPromptResult } from '@/types';

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

  if (!res.ok) {
    // The response is an error. Read the body as text.
    const errorText = await res.text();
    // Try to parse it as JSON to get a structured error message.
    try {
      const errorJson = JSON.parse(errorText);
      // Use the error message from the JSON if available, otherwise use the raw text.
      throw new Error(errorJson?.error || errorText);
    } catch (e) {
      // If parsing fails, the error response was not JSON. Throw the text content.
      throw new Error(errorText || `Request failed with status ${res.status}`);
    }
  }

  // If we reach here, res.ok was true. We can expect a JSON body.
  const body = await res.json();

  if (!body?.success) {
    // This handles cases where the status is 200 OK, but our backend logic returned success: false
    throw new Error(body?.error || 'An error occurred while enhancing the prompt.');
  }

  return body.data;
}
