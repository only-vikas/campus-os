import { OpenRouter } from "@openrouter/sdk";
import { jsonrepair } from 'jsonrepair';
import { queryOllama } from './ollamaService';
import { useDesktopStore } from '@/stores/useDesktopStore';

interface AIConfig {
  apiKey: string;
  model: string;
  name: string;
}

export const AI_CONFIGS: AIConfig[] = [
  {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_1 || "",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    name: "nemotron-nano-reasoning"
  },
  {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_2 || "",
    model: "google/gemma-4-26b-a4b-it:free",
    name: "gemma-4-26b"
  },
  {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_3 || "",
    model: "openai/gpt-oss-20b:free",
    name: "gpt-oss-20b"
  },
  {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_4 || "",
    model: "liquid/lfm-2.5-2.6b:free",
    name: "lfm-2.5-2.6b"
  }
];

export interface AnalysisResult {
  matchScore: number;
  qualityRating: 'Poor' | 'Average' | 'Good' | 'Excellent';
  matchedSkills: { skill: string; category: string; strength: string }[];
  missingSkills: { skill: string; importance: string; learnPath: string }[];
  weakBullets: { text: string; reason: string; enhancedVersion: string }[];
  missingMetrics: { bullet: string; suggestion: string }[];
  atsFlags: { issue: string; severity: 'low' | 'medium' | 'high'; fix: string }[];
  interviewQuestions: { question: string; topic: string; difficulty: 'easy' | 'medium' | 'hard' }[];
  summary: string;
}

export function extractJSON(response: string): any {
  // Try markdown code block first
  const mdMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (mdMatch) return JSON.parse(jsonrepair(mdMatch[1]));
  
  // Try raw JSON object
  const rawMatch = response.match(/\{[\s\S]*\}/);
  if (rawMatch) return JSON.parse(jsonrepair(rawMatch[0]));

  // Try jsonrepair on entire response
  try {
    return JSON.parse(jsonrepair(response));
  } catch {
    throw new Error("Could not extract valid JSON from AI response");
  }
}

export async function analyzeResume(
  resumeText: string,
  jdText: string,
  onProgress?: (msg: string) => void
): Promise<AnalysisResult> {
  const prompt = `Analyze this resume against this job description. Return STRICT JSON:
{
  "matchScore": 0-100,
  "qualityRating": "Poor"|"Average"|"Good"|"Excellent",
  "matchedSkills": [{"skill":"...","category":"...","strength":"..."}],
  "missingSkills": [{"skill":"...","importance":"...","learnPath":"..."}],
  "weakBullets": [{"text":"...","reason":"...","enhancedVersion":"..."}],
  "missingMetrics": [{"bullet":"...","suggestion":"..."}],
  "atsFlags": [{"issue":"...","severity":"low|medium|high","fix":"..."}],
  "interviewQuestions": [{"question":"...","topic":"...","difficulty":"easy|medium|hard"}],
  "summary": "2-3 sentence overview"
}

RESUME:
${resumeText.slice(0, 8000)}

JOB DESCRIPTION:
${jdText.slice(0, 8000)}`;

  const model = useDesktopStore.getState().ollamaModel || 'deepseek-r1:1.5b';
  return queryOllama(prompt, model, onProgress, true) as Promise<AnalysisResult>;
}

export async function enhanceBullet(
  bulletText: string,
  missingKeywords: string[],
  keyIndex: number = 0
): Promise<string> {
  const prompt = `Enhance this resume bullet point by naturally incorporating these missing keywords: ${missingKeywords.join(", ")}. Keep it realistic and professional.

Bullet: "${bulletText}"

Return ONLY the enhanced bullet, no explanation.`;

  const model = useDesktopStore.getState().ollamaModel || 'deepseek-r1:1.5b';
  return queryOllama(prompt, model, undefined, false) as Promise<string>;
}
