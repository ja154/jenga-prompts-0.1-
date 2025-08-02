import { useState } from 'react';

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

  const [modifiers, setModifiers] = useState<Record<string, string>>({
    imageStyle: '',
    contentTone: '',
    lighting: '',
    framing: '',
    aspectRatio: '',
    codeLanguage: '',
    codeTask: '',
    audioType: '',
    audioVibe: '',
  });

  const handleChange = (key: string, value: string) => {
    setModifiers(prev => ({ ...prev, [key]: value }));
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
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-xl font-semibold mb-4">✨ Prompt Enhancer</h2>

      <textarea
        className="w-full p-2 border rounded text-sm mb-3"
        rows={3}
        value={userPrompt}
        onChange={e => {
          setUserPrompt(e.target.value);
          setWordCount(e.target.value.trim().split(/\s+/).length);
        }}
        placeholder="Enter your raw prompt idea..."
      />

      {/* Selectors */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
        <div>
          <label className="block font-medium mb-1">Mode</label>
          <select className="border rounded p-1 w-full" value={mode} onChange={e => setMode(e.target.value as any)}>
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Output</label>
          <select className="border rounded p-1 w-full" value={outputStructure} onChange={e => setOutputStructure(e.target.value as any)}>
            {OUTPUT_STRUCTURES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Model</label>
          <select className="border rounded p-1 w-full" value={model} onChange={e => setModel(e.target.value as any)}>
            {GEMINI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Modifiers */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        {mode === 'image' && (
          <>
            <input className="border p-1 rounded" placeholder="Style" value={modifiers.imageStyle} onChange={e => handleChange('imageStyle', e.target.value)} />
            <input className="border p-1 rounded" placeholder="Lighting" value={modifiers.lighting} onChange={e => handleChange('lighting', e.target.value)} />
            <input className="border p-1 rounded" placeholder="Framing" value={modifiers.framing} onChange={e => handleChange('framing', e.target.value)} />
            <input className="border p-1 rounded" placeholder="Aspect Ratio" value={modifiers.aspectRatio} onChange={e => handleChange('aspectRatio', e.target.value)} />
          </>
        )}
        {mode === 'code' && (
          <>
            <input className="border p-1 rounded" placeholder="Language" value={modifiers.codeLanguage} onChange={e => handleChange('codeLanguage', e.target.value)} />
            <input className="border p-1 rounded" placeholder="Task" value={modifiers.codeTask} onChange={e => handleChange('codeTask', e.target.value)} />
          </>
        )}
        {mode === 'audio' && (
          <>
            <input className="border p-1 rounded" placeholder="Audio Type" value={modifiers.audioType} onChange={e => handleChange('audioType', e.target.value)} />
            <input className="border p-1 rounded" placeholder="Audio Vibe" value={modifiers.audioVibe} onChange={e => handleChange('audioVibe', e.target.value)} />
          </>
        )}
      </div>

      <button
        onClick={handleEnhance}
        disabled={loading || !userPrompt.trim()}
        className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Enhancing...' : 'Generate Prompt'}
      </button>

      {/* Output Section */}
      <div className="mt-5 text-sm whitespace-pre-wrap text-gray-800 border-t pt-4 max-h-[300px] overflow-auto">
        {responseText || (loading ? '⏳ Waiting for Gemini...' : 'Your enhanced prompt will appear here.')}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Words: {wordCount} &nbsp;|&nbsp; ~Tokens: {Math.ceil(wordCount * 1.33)}
      </div>

      {errorLog && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-xs whitespace-pre-wrap">
          <strong>Error Log:</strong>
          <pre>{errorLog}</pre>
        </div>
      )}
    </div>
  );
}
