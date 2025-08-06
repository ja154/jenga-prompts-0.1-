// Non-streaming version
export async function getEnhancedPrompt({
    userPrompt,
    mode,
    options
}: {
    userPrompt: string;
    mode: string;
    options: Record<string, any>;
}) {
    try {
        const apiUrl = '/api/gemini-non-stream';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': import.meta.env.VITE_CLIENT_API_KEY,
            },
            body: JSON.stringify({
                userPrompt,
                mode,
                options
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
            const details = errorData.details || response.statusText;
            const cause = errorData.cause;
            const errorMessage = `API Error: ${details}`;

            const error = new Error(errorMessage);
            if (cause) {
                (error as any).cause = cause;
            }
            throw error;
        }

        return await response.json();

    } catch (error) {
        if (error instanceof Error) {
            // Re-throw the error with the attached cause if it exists
            if ((error as any).cause) {
                throw error;
            }
            // For network errors or other issues, wrap in a generic message
            throw new Error(`Failed to fetch prompt enhancement: ${error.message}`);
        }
        // Fallback for non-Error objects thrown
        throw new Error('An unknown error occurred during the enhancement process.');
    }
}

// Streaming version for better UX
export async function getEnhancedPromptStream({
    userPrompt,
    mode,
    options,
    onChunk,
    onComplete,
    onError
}: {
    userPrompt: string;
    mode: string;
    options: Record<string, any>;
    onChunk?: (text: string) => void;
    onComplete?: (fullText: string) => void;
    onError?: (error: Error) => void;
}) {
    try {
        const apiUrl = '/api/gemini-stream';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': import.meta.env.VITE_CLIENT_API_KEY,
            },
            body: JSON.stringify({
                userPrompt,
                mode,
                options
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error('No response body for streaming');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                
                if (onChunk) {
                    onChunk(chunk);
                }
            }

            if (onComplete) {
                onComplete(fullText);
            }

            return {
                primaryResult: fullText,
                jsonResult: undefined
            };

        } finally {
            reader.releaseLock();
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
        
        if (onError) {
            onError(new Error(errorMessage));
        }
        
        throw new Error(`Streaming error: ${errorMessage}`);
    }
}
