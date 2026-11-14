import { NextRequest, NextResponse } from 'next/server';

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

const SYSTEM_PROMPT = `You are Nova, an expert AI learning tutor embedded in NovaMind (Campus OS).

Your capabilities:
- Explain programming concepts at the user's mastery level
- Generate multiple-choice quiz questions with explanations
- Create mini projects and challenges
- Motivate and guide students on their learning journey
- Provide career advice for Indian software engineering job market

Format rules:
- Use **bold** for key terms
- Use \`code\` for inline code
- Use ## headings for sections
- Use - bullet points for lists
- Keep explanations concise (150-300 words) unless a quiz is requested
- For quizzes: format as JSON with fields: question, options (array), correctIndex, explanation

Personality: Encouraging, precise, friendly. Never say "I cannot" — always find a way to help.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    // Inject context about user's skill levels
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nUser context:\n- Career goal: ${context.careerGoal}\n- Skill levels: ${JSON.stringify(context.topSkills)}`
      : SYSTEM_PROMPT;

    // 1. Try Ollama first (tight 2.5s timeout)
    try {
      const ollamaRes = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          messages: [
            { role: 'system', content: systemWithContext },
            ...messages,
          ],
          stream: false,
        }),
        signal: AbortSignal.timeout(2500),
      });
      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const content = data.message?.content || '';
        if (content) return NextResponse.json({ content, provider: 'ollama', model: 'deepseek-r1:1.5b (Local)' });
      }
    } catch {
      /* fall through to cloud fallback */
    }

    // 2. Fallback: OpenRouter
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'No AI provider available. Please start Ollama or set OPENROUTER_API_KEY.' },
        { status: 503 }
      );
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
              { role: 'system', content: systemWithContext },
              ...messages,
            ],
            max_tokens: 1024,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({ content, provider: 'openrouter', model });
          }
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ error: 'All AI models failed to respond' }, { status: 502 });
  } catch (err) {
    console.error('NovaMind tutor error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
