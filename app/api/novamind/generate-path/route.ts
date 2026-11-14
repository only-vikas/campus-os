import { NextRequest, NextResponse } from 'next/server';
import { jsonrepair } from 'jsonrepair';

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_1 ||
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
  '';

const FALLBACK_MODELS = [
  'nvidia/nemotron-3.5-lightning:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'liquid/lfm-3-1.7b:free',
];

const SYSTEM_PROMPT = `You are NovaMind, an advanced AI learning coach built into Campus OS.

Your role:
- Generate personalized, project-based learning roadmaps
- Each roadmap has exactly 5 milestones
- Each milestone should be achievable in 7-14 days
- Include a hands-on project for each milestone
- Base recommendations on the user's current skill levels and career goal

ALWAYS respond with valid JSON in this exact format:
{
  "title": "Learning Path: [Goal]",
  "careerGoal": "[user's goal]",
  "totalDays": 60,
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone title",
      "description": "What the user will learn and achieve",
      "skillIds": ["skill-id-1", "skill-id-2"],
      "estimatedDays": 12,
      "completed": false,
      "project": "Mini project description"
    }
  ]
}

Be specific, practical, and motivating. Use Indian context where relevant (INR, Indian job market, etc.)`;

function safeParseJSON(text: string) {
  try {
    const mdMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (mdMatch) return JSON.parse(jsonrepair(mdMatch[1]));
    const rawMatch = text.match(/\{[\s\S]*\}/);
    if (rawMatch) return JSON.parse(jsonrepair(rawMatch[0]));
    return JSON.parse(jsonrepair(text));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { careerGoal, skillLevels, targetRole } = body;

    const userPrompt = `Generate a personalized learning path for:
Career Goal: ${careerGoal || 'Software Engineer'}
Target Role: ${targetRole || 'Full-Stack Developer'}
Current Skills (skill: mastery 0-100): ${JSON.stringify(skillLevels || {}, null, 2)}

Create a 5-milestone path with projects. Focus on skill gaps and fill them progressively.`;

    // 1. Try Ollama first
    try {
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
          stream: false,
          format: 'json',
        }),
        signal: AbortSignal.timeout(2500),
      });
      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const raw = data.response || '';
        const parsed = safeParseJSON(raw);
        if (parsed) {
          return NextResponse.json({ path: parsed, provider: 'ollama', model: 'deepseek-r1:1.5b (Local)' });
        }
      }
    } catch {
      /* fall through to OpenRouter */
    }

    // 2. Fallback: OpenRouter
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'No AI provider available' }, { status: 503 });
    }

    for (const model of FALLBACK_MODELS) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Campus OS NovaMind',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 2000,
            temperature: 0.4,
          }),
          signal: AbortSignal.timeout(18000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '{}';
          const parsed = safeParseJSON(content);
          if (parsed && parsed.milestones) {
            return NextResponse.json({ path: parsed, provider: 'openrouter', model });
          }
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ error: 'Failed to generate path from all models' }, { status: 502 });
  } catch (err) {
    console.error('NovaMind path generation error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
