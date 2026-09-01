import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

const SYSTEM_PROMPT = `You are Nova, an expert FinTech education AI assistant built into FinSack on Campus OS.

Your role:
- Help users understand trading strategies, financial concepts, and market analysis
- Explain complex financial topics in clear, structured markdown
- Provide entry/exit rules, risk management tips, and practical examples
- Use bullet points, bold text, and clear headings for readability
- Be concise but thorough — target 200-400 words per response
- Always mention relevant risk disclaimers when discussing specific trades

Format your responses using markdown with:
- # and ## headings for sections
- **bold** for key terms
- - bullet points for lists

You are friendly, professional, and educational. Never provide specific buy/sell recommendations — always frame as educational content.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessages = body.messages || [];

    // 1. Try local Ollama first
    try {
      const ollamaRes = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...userMessages,
          ],
          stream: false,
        }),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const content = data.message?.content || '';
        if (content) {
          return NextResponse.json({ content, provider: 'ollama' });
        }
      }
    } catch {
      // Ollama not available, fall through to OpenRouter
    }

    // 2. Fallback to OpenRouter
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'No AI provider available. Please start Ollama or set OPENROUTER_API_KEY.' },
        { status: 503 }
      );
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...userMessages,
    ];

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
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return NextResponse.json(
        { error: 'AI provider error', details: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ content, provider: 'openrouter' });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
