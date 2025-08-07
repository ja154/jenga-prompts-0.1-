// Hugging Face Inference API - Free alternative to Gemini
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { userPrompt, mode, options } = req.body;
        
        if (!userPrompt) {
            res.status(400).json({ error: 'Missing userPrompt' });
            return;
        }

        // Hugging Face API key (free to get from huggingface.co)
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'Hugging Face API key not configured' });
            return;
        }

        // Build system instruction
        const systemInstruction = buildSystemInstruction(mode, options);
        const fullPrompt = `${systemInstruction}\n\nUser Request: ${userPrompt}`;

        // Using Mistral-7B model (free on Hugging Face)
        const response = await fetch(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: fullPrompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        return_full_text: false
                    },
                    stream: true
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
        }

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.token && parsed.token.text) {
                                res.write(parsed.token.text);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        res.end();

    } catch (error) {
        console.error('Hugging Face API Error:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to generate content',
                details: error.message 
            });
        } else {
            res.write(`\n\nError: ${error.message}`);
            res.end();
        }
    }
}

function buildSystemInstruction(mode, options) {
    let instruction = `You are a world-class prompt engineer. Your mission is to expand a user's simple idea into a rich, detailed, and highly effective prompt for a generative AI model.`;
    
    let modeInstruction = '';
    let paramsToIncorporate = '';

    const addParam = (label, value) => {
        if (value) {
            paramsToIncorporate += `- ${label}: ${value}\n`;
        }
    };

    switch (mode) {
        case 'Image':
            modeInstruction = `Create a detailed prompt for an AI image generator. Focus on visual elements, style, and composition.`;
            addParam('Style', options.imageStyle);
            addParam('Mood/Tone', options.contentTone);
            addParam('Lighting', options.lighting);
            break;
        case 'Video':
            modeInstruction = `Create a prompt for AI video generation, focusing on motion and visual storytelling.`;
            addParam('Tone', options.contentTone);
            addParam('Point of View', options.pov);
            break;
        case 'Text':
            modeInstruction = `Refine the user's request into a clear and effective text generation prompt.`;
            addParam('Tone of Voice', options.contentTone);
            addParam('Output Format', options.outputFormat);
            break;
        case 'Audio':
            modeInstruction = `Create a detailed prompt for AI audio/music generation.`;
            addParam('Audio Type', options.audioType);
            addParam('Vibe/Mood', options.audioVibe);
            break;
        case 'Code':
            modeInstruction = `Create a precise prompt for code generation, including context and requirements.`;
            addParam('Language', options.codeLanguage);
            addParam('Task', options.codeTask);
            break;
        default:
            modeInstruction = `Generate a general-purpose, high-quality prompt.`;
            break;
    }

    instruction += `\n\n### Task\n${modeInstruction}`;
    if (paramsToIncorporate) {
        instruction += `\n\n### Parameters to Incorporate\n${paramsToIncorporate}`;
    }

    return instruction;
}
