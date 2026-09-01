import { OpenRouter } from '@openrouter/sdk';
import { AI_CONFIGS, extractJSON } from './aiService';

export async function queryOllama(
  prompt: string,
  model: string = 'deepseek-r1:1.5b',
  onProgress?: (msg: string) => void,
  expectJson: boolean = false
): Promise<string | any> {
  // 1. Try local Ollama API
  try {
    onProgress?.(`Querying Local AI (${model})...`);
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: expectJson ? 'json' : undefined
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      onProgress?.(`Success with Ollama!`);
      if (expectJson) {
        return extractJSON(data.response);
      }
      return data.response;
    }
  } catch (e) {
    console.warn('Ollama local inference failed, falling back to OpenRouter cloud:', e);
  }

  // 2. Fallback to OpenRouter chain
  for (let i = 0; i < AI_CONFIGS.length; i++) {
    const config = AI_CONFIGS[i];
    try {
      onProgress?.(`Falling back to Cloud AI (${config.name})...`);
      
      const openrouter = new OpenRouter({ apiKey: config.apiKey });
      const stream: any = await openrouter.chat.send({
        chatRequest: {
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          stream: true
        }
      });

      let response = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) response += content;
      }

      onProgress?.(`Success with ${config.name}!`);
      
      if (expectJson) {
        return extractJSON(response);
      }
      
      return response;
      
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('rate limit')) {
        const delay = Math.min(1000 * Math.pow(2, i), 8000);
        await new Promise(r => setTimeout(r, delay));
      }
      console.warn(`Cloud AI ${config.name} failed:`, err);
      continue;
    }
  }

  throw new Error("Local AI is down and all Cloud Fallbacks failed. Please check your connection.");
}
