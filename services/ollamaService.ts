import { AI_CONFIGS, extractJSON } from './aiService';
import { useDesktopStore } from '@/stores/useDesktopStore';

export async function queryOllama(
  prompt: string,
  model: string = 'deepseek-r1:1.5b',
  onProgress?: (msg: string) => void,
  expectJson: boolean = false
): Promise<string | any> {
  const setActiveAI = useDesktopStore.getState().setActiveAI;

  setActiveAI({
    isGenerating: true,
    statusText: `Connecting to Local AI (${model})...`,
  });

  // 1. Try local Ollama API with a tight 2.5s timeout
  try {
    onProgress?.(`Querying Local AI (${model})...`);
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: expectJson ? 'json' : undefined,
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      onProgress?.(`Connected to Local Ollama (${model})`);
      setActiveAI({
        provider: 'local-ollama',
        modelName: `${model} (Local)`,
        statusText: `Local: ${model}`,
        isGenerating: false,
      });
      if (expectJson) {
        return extractJSON(data.response);
      }
      return data.response;
    }
  } catch (e) {
    console.warn('Ollama local inference failed / offline / timed out (>2.5s). Falling back to OpenRouter cloud:', e);
  }

  // 2. Fallback to OpenRouter chain
  onProgress?.('Local AI slow or offline. Engaging Cloud AI models...');
  setActiveAI({
    statusText: 'Engaging Cloud AI Fallback...',
  });

  for (let i = 0; i < AI_CONFIGS.length; i++) {
    const config = AI_CONFIGS[i];
    if (!config.apiKey) continue;
    try {
      onProgress?.(`Querying Cloud AI (${config.name})...`);
      setActiveAI({
        provider: 'cloud-openrouter',
        modelName: config.name,
        statusText: `Cloud: ${config.name} (Running)`,
        isGenerating: true,
      });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'Campus OS',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Cloud AI ${config.name} returned HTTP ${res.status}:`, errText);
        continue;
      }

      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || '';
      if (!response) {
        console.warn(`Cloud AI ${config.name} returned empty text`);
        continue;
      }

      onProgress?.(`Success with Cloud AI (${config.name})!`);
      setActiveAI({
        provider: 'cloud-openrouter',
        modelName: `${config.name} (Cloud)`,
        statusText: `Cloud: ${config.name}`,
        isGenerating: false,
      });

      if (expectJson) {
        return extractJSON(response);
      }

      return response;
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('rate limit')) {
        const delay = Math.min(1000 * Math.pow(2, i), 8000);
        await new Promise((r) => setTimeout(r, delay));
      }
      console.warn(`Cloud AI ${config.name} failed:`, err);
      continue;
    }
  }

  setActiveAI({
    isGenerating: false,
    statusText: 'AI Providers Offline',
  });
  throw new Error('Local AI is down and all Cloud Fallbacks failed. Please check your connection.');
}
