import { OpenRouter } from "@openrouter/sdk";
import { jsonrepair } from 'jsonrepair';
import { queryOllama } from './ollamaService';
import { useDesktopStore } from '@/stores/useDesktopStore';

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

export function validateCode(code: string, selectedLanguage: string) {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: "⚠️ Please paste some code to analyze." };
  }
  
  const lines = code.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 3) {
    return { valid: false, message: "⚠️ Code seems too short. Please paste at least 3 lines of code." };
  }
  
  const patterns: Record<string, RegExp> = {
    java: /public\s+class|System\.out|import\s+java|@Override/,
    python: /def\s+\w+\s*\(|print\(|if\s+__name__\s*==/,
    javascript: /function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|console\.log|import\s+.*?from/,
    typescript: /interface\s+\w+|type\s+\w+\s*=|function\s+\w+\s*\(.*:\s*\w+/,
    cpp: /#include\s*<|using\s+namespace\s+std|int\s+main\s*\(/,
    go: /package\s+main|func\s+\w+\s*\(|import\s*\(/,
    rust: /fn\s+main|let\s+mut|println!/
  };
  
  let detected: string[] = [];
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) detected.push(lang);
  }
  
  if (detected.length === 0) {
    return { valid: false, message: "❌ Coding language not recognized. Please paste valid programming code." };
  }
  
  if (selectedLanguage && !detected.includes(selectedLanguage.toLowerCase())) {
    return {
      valid: true,
      warning: `⚠️ Language mismatch! Detected: ${detected.join(', ')}, Selected: ${selectedLanguage}. Using ${detected[0]} analysis.`,
      detectedLanguage: detected[0]
    };
  }
  
  return { valid: true, detectedLanguage: detected[0], warning: null };
}

export function handleAPIError(error: any): string {
  const msg = error.message || String(error);
  if (msg.includes('401')) return '🔑 Invalid API key. Please check your API key settings.';
  if (msg.includes('403')) return '💰 Insufficient credits. Please add funds to your account.';
  if (msg.includes('429') || msg.includes('rate limit')) return '⏳ Too many requests. Please wait a moment and try again.';
  if (msg.includes('500')) return '🔧 Server error. Please try again later.';
  if (msg.toLowerCase().includes('timeout') || msg.includes('ECONNRESET')) return '⏰ Request timed out. Please try with shorter code or try again.';
  if (msg.includes('NetworkError') || msg.includes('fetch')) return '🌐 Network error. Please check your internet connection.';
  return `❌ Unexpected error: ${msg}`;
}

export async function analyzeCode(
  code: string,
  language: string,
  onProgress?: (msg: string) => void
): Promise<CodeAnalysisResult> {
  const prompt = `Analyze this ${language} code for bugs, security vulnerabilities, performance issues, code smells, and best practice violations. Return STRICT JSON with: overallScore (0-100), issues array (line, severity, category, title, description, fix, explanation, cweId, learnMore), summary, improvedCode. CODE: \n\n${code}`;

  const model = useDesktopStore.getState().ollamaModel || 'deepseek-r1:1.5b';
  return queryOllama(prompt, model, onProgress, true) as Promise<CodeAnalysisResult>;
}
