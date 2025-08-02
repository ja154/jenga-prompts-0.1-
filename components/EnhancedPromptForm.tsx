import { useState, useEffect } from 'react';

const MODES = ['image', 'text', 'audio', 'video', 'code'] as const;
const OUTPUT_STRUCTURES = ['paragraph', 'SimpleJSON', 'DetailedJSON'] as const;
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro'] as const;

export default function EnhancedPromptForm() {
  const [userPrompt, setUserPrompt] = useState('');
  const [mode, setMode] = useState<typeof MODES[number]>('image');
  const [outputStructure, setOutputStructure] = useState<typeof OUTPUT_STRUCTURES[number]>('paragraph');
  const [model, setModel] = useState<typeof GEMINI_MODELS[number]>('gemini-1.5-flash');

  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorLog, setErrorLog] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [status, setStatus] = useState('Your expertly crafted prompt will appear here...');

  useEffect(() => {
    if (loading) {
      setStatus('⏳ Waiting for Gemini...');
      const timeout = setTimeout(() => {
        setStatus("⚠️ This is taking longer than expected. The initial model can be slow on cold starts. Please wait a bit longer.");
      }, 10000); // 10 seconds
      return () => clearTimeout(timeout);
    } else {
        if (!responseText && !errorLog) {
            setStatus('Your expertly crafted prompt will appear here...');
        }
    }
  }, [loading, responseText, errorLog]);

  const [modifiers, setModifiers] = useState<Record<string, string>>({
    imageStyle: 'Cinematic',
    contentTone: 'Neutral',
    lighting: 'Golden Hour',
    framing: 'MediumShot',
    aspectRatio: 'Landscape (16:9)',
    cameraAngle: 'Frontal',
    detailLevel: 'Hyper-detailed',
    additionalDetails: '',
    codeLanguage: '',
    codeTask: '',
    audioType: '',
    audioVibe: '',
  });

  const handleChange = (key: string, value: string) => {
    setModifiers(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = () => {
    if (!responseText) return;
    navigator.clipboard.writeText(responseText).then(() => {
        alert("Copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy to clipboard.");
    });
  };

  const handleEnhance = async () => {
    setLoading(true);
    setResponseText('');
    setErrorLog('');

    const payload = {
      userPrompt,
      mode,
      options: {
        ...modifiers,
        outputStructure,
        model,
      },
    };

    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      setErrorLog(`❌ ${err.error || 'Internal Server Error'}`);
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      setErrorLog('❌ Failed to read response stream.');
      setLoading(false);
      return;
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data:'));

        for (const line of lines) {
          const json = line.replace('data: ', '').trim();

          try {
            const parsed = JSON.parse(json);

            if (parsed.chunk) {
              setResponseText(prev => {
                const updated = prev + parsed.chunk;
                const words = updated.trim().split(/\s+/).length;
                setWordCount(words);
                return updated;
              });
            }

            if (parsed.error) {
              setErrorLog(parsed.error);
            }
          } catch (err) {
            setErrorLog(prev => prev + `\n[stream parse error] ${line}`);
          }
        }
      }
    } catch (err) {
      setErrorLog(`❌ Stream error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">JengaPrompts Pro</h1>
            <p className="text-gray-600 dark:text-gray-300">The professional toolkit to build, test, and optimize prompts for any AI model.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="step-box">
                <h2 className="text-xl font-semibold mb-2">Step 1: Define Your Prompt</h2>
                <label className="block font-medium mb-1">Select Prompt Mode</label>
                <select
                    className="w-full border border-gray-300 rounded-md p-2 mb-3"
                    value={mode}
                    onChange={e => setMode(e.target.value as any)}
                >
                    {MODES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
                <label className="block font-medium mb-1">Your Core Idea or Concept</label>
                <input
                    type="text"
                    placeholder="e.g., An astronaut riding a horse..."
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                />
            </div>

            <div className="step-box">
                <h2 className="text-xl font-semibold mb-2">Step 2: Add Modifiers</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1">Output Format</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={outputStructure}
                            onChange={e => setOutputStructure(e.target.value as any)}
                        >
                            {OUTPUT_STRUCTURES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Tone / Mood</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={modifiers.contentTone}
                            onChange={e => handleChange('contentTone', e.target.value)}
                        >
                            <option>Neutral</option>
                            <option>Whimsical</option>
                            <option>Serious</option>
                            <option>Humorous</option>
                        </select>
                    </div>
                    {mode === 'image' && (
                        <>
                           <div>
                                <label className="block font-medium mb-1">Style</label>
                                <select className="w-full border border-gray-300 rounded-md p-2" value={modifiers.imageStyle} onChange={e => handleChange('imageStyle', e.target.value)}>
                                    <option>Cinematic</option>
                                    <option>Photorealistic</option>
                                    <option>Cartoonish</option>
                                    <option>Abstract</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Aspect Ratio</label>
                                <select className="w-full border border-gray-300 rounded-md p-2" value={modifiers.aspectRatio} onChange={e => handleChange('aspectRatio', e.target.value)}>
                                    <option>Landscape (16:9)</option>
                                    <option>Portrait (9:16)</option>
                                    <option>Square (1:1)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Lighting</label>
                                <select className="w-full border border-gray-300 rounded-md p-2" value={modifiers.lighting} onChange={e => handleChange('lighting', e.target.value)}>
                                    <option>Golden Hour</option>
                                    <option>Studio Lighting</option>
                                    <option>Neon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Framing</label>
                                <select className="w-full border border-gray-300 rounded-md p-2" value={modifiers.framing} onChange={e => handleChange('framing', e.target.value)}>
                                    <option>Medium Shot</option>
                                    <option>Close Up</option>
                                    <option>Wide Shot</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Camera Angle</label>
                                <select className="w-full border border-gray-300 rounded-md p-2" value={modifiers.cameraAngle} onChange={e => handleChange('cameraAngle', e.target.value)}>
                                    <option>Frontal</option>
                                    <option>High-angle</option>
                                    <option>Low-angle</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Detail Level</label>
                                <select className="w-full border border-gray-300 rounded-md p-2" value={modifiers.detailLevel} onChange={e => handleChange('detailLevel', e.target.value)}>
                                    <option>Hyper-detailed</option>
                                    <option>Minimalist</option>
                                    <option>Standard</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
                <label className="block font-medium mt-4 mb-1">Additional Details (Optional)</label>
                <textarea
                    className="w-full border border-gray-300 rounded-md p-2"
                    rows={3}
                    placeholder="E.g., turquoise rings, stark white background..."
                    value={modifiers.additionalDetails}
                    onChange={e => handleChange('additionalDetails', e.target.value)}
                ></textarea>
                <button
                    onClick={handleEnhance}
                    disabled={loading || !userPrompt.trim()}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Enhancing...' : 'Enhance Prompt'}
                </button>
            </div>
        </section>

        <section className="step-box mb-10">
            <h2 className="text-xl font-semibold mb-2">Step 3: Your Enhanced Prompt</h2>
            <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                rows={4}
                readOnly
                placeholder={status}
                value={responseText}
            ></textarea>
            {errorLog && (
                <div className="mt-2 p-3 bg-red-100 text-red-800 rounded text-xs whitespace-pre-wrap">
                    <strong>Error Log:</strong>
                    <pre>{errorLog}</pre>
                </div>
            )}
            <button
                onClick={handleCopyToClipboard}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
            >
                Copy
            </button>
        </section>

        <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-center gradient-text">Prompt Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Realistic Polaroid Photo</h3>
                    <p className="text-sm text-gray-600">Generates a realistic, awkwardly-framed polaroid with harsh flash and film texture.</p>
                </div>
                <div className="glass p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Classic Disney Character</h3>
                    <p className="text-sm text-gray-600">Transforms a character description into the classic, hand-drawn Disney animation style.</p>
                </div>
                <div className="glass p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Your Home As A LEGO Set</h3>
                    <p className="text-sm text-gray-600">Renders a house as a photorealistic LEGO Creator Expert playset, complete with box art.</p>
                </div>
                <div className="glass p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Collectible Beanie Baby</h3>
                    <p className="text-sm text-gray-600">Creates a photo of a custom, 1990s-style collectible Beanie Baby plush toy with a tag.</p>
                </div>
                <div className="glass p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Awkward 90’s Yearbook Photo</h3>
                    <p className="text-sm text-gray-600">Generates a cheesy, awkward 1990s high school yearbook photo with a laser background.</p>
                </div>
            </div>
        </section>

        <footer className="text-center text-gray-500 text-sm">
            <p className="mb-2">© 2024 JengaPrompts Pro. All rights reserved.</p>
        </footer>
    </div>
  );
}
