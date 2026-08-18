import { OpenRouter } from "@openrouter/sdk";
import { jsonrepair } from 'jsonrepair';

interface AIConfig {
  apiKey: string;
  model: string;
  name: string;
}

// Ordered strictly by performance priority
const AI_CONFIGS: AIConfig[] = [
  {
    apiKey: process.env.NEXT_PUBLIC_CODEGUARD_LYRIA_PRO_API_KEY || "",
    model: "google/lyria-3-pro-preview",
    name: "lyria-3-pro"
  },
  {
    apiKey: process.env.NEXT_PUBLIC_CODEGUARD_GEMMA_31B_API_KEY || "",
    model: "google/gemma-4-31b-it:free",
    name: "gemma-4-31b"
  },
  {
    apiKey: process.env.NEXT_PUBLIC_CODEGUARD_LYRIA_CLIP_API_KEY || "",
    model: "google/lyria-3-clip-preview",
    name: "lyria-3-clip"
  },
  {
    apiKey: process.env.NEXT_PUBLIC_CODEGUARD_DOTS_NOTE_API_KEY || "",
    model: "dots-studio/dots-3-note-preview:free",
    name: "dots-3-note"
  }
];

export interface CodeAnalysisResult {
  overallScore: number;
  issues: {
    line: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'bug' | 'security' | 'performance' | 'smell' | 'practice';
    title: string;
    description: string;
    fix: string;
    explanation: string;
    cweId?: string;
    learnMore?: string;
  }[];
  summary: string;
  improvedCode: string;
}

function extractJSON(response: string): any {
  const mdMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (mdMatch) return JSON.parse(jsonrepair(mdMatch[1]));
  const rawMatch = response.match(/\{[\s\S]*\}/);
  if (rawMatch) return JSON.parse(jsonrepair(rawMatch[0]));
  return JSON.parse(jsonrepair(response));
}

export async function analyzeCode(
  code: string,
  language: string,
  onProgress?: (msg: string) => void
): Promise<CodeAnalysisResult> {
  const prompt = `Analyze this ${language} code for bugs, security vulnerabilities, performance issues, code smells, and best practice violations. Return STRICT JSON with: overallScore (0-100), issues array (line, severity, category, title, description, fix, explanation, cweId, learnMore), summary, improvedCode. CODE: \n\n${code}`;

  for (let i = 0; i < AI_CONFIGS.length; i++) {
    const config = AI_CONFIGS[i];
    try {
      onProgress?.(`Analyzing via ${config.name}...`);
      const openrouter = new OpenRouter({ apiKey: config.apiKey });
      const stream = await openrouter.chat.send({
        chatRequest: {
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          stream: true
        }
      });
      
      let responseText = "";
      for await (const chunk of stream as any) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) responseText += content;
      }
      
      const parsed = extractJSON(responseText);
      onProgress?.(`Success!`);
      return parsed as CodeAnalysisResult;
      
    } catch (err: any) {
      console.warn(`AI ${config.name} failed:`, err);
      if (err.status === 429 || err.message?.includes('rate limit')) {
        await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, i), 8000)));
      }
      continue;
    }
  }
  throw new Error("All 4 AI models failed. Please try again later.");
}
