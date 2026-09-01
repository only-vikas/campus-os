import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

const SYSTEM_PROMPT = `You are a financial education content writer. Generate clear, well-structured markdown notes for a trading strategy lesson. 

Format requirements:
- Start with a ## Overview section
- Use ## headings for: Entry Rules, Exit Rules, Risk Management, Pros, Cons
- Use bullet points extensively
- Include practical examples where relevant
- Keep the content between 300-500 words
- Use **bold** for key terms
- Be educational and clear, suitable for intermediate traders`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, strategyId } = body;

    if (!prompt || !strategyId) {
      return NextResponse.json(
        { error: 'Missing prompt or strategyId' },
        { status: 400 }
      );
    }

    // 1. Try local Ollama first
    try {
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
          stream: false,
        }),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const content = data.response || '';
        if (content) {
          return NextResponse.json({ content, cached: false, provider: 'ollama' });
        }
      }
    } catch {
      // Ollama not available, fall through
    }

    // 2. Fallback to OpenRouter
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'No AI provider available.' },
        { status: 503 }
      );
    }

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.6,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter notes error:', errText);
      return NextResponse.json(
        { error: 'AI provider error' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content || 'Notes generation failed.';

    return NextResponse.json({ content, cached: false, provider: 'openrouter' });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
