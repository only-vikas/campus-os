import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_1 ||
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
  '';

const FALLBACK_MODELS = [
  'dots-studio/dots-3-note-preview:free',
  'liquid/lfm-3-1.7b:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3.5-lightning:free',
];

const SYSTEM_PROMPT = `You are a financial education content writer. Generate clear, well-structured markdown notes for a trading strategy lesson. 

Format requirements:
- Start with a ## Overview section
- Use ## headings for: Entry Rules, Exit Rules, Risk Management, Pros, Cons
- Use bullet points extensively
- Include practical examples where relevant
- Keep the content between 300-500 words
- Use **bold** for key terms
- Be educational and clear, suitable for intermediate traders`;

function generateFallbackNotes(strategyId: string, prompt: string) {
  const cleanTitle = strategyId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `## Overview
**${cleanTitle}** is a proven financial methodology designed to help investors and traders make disciplined, data-driven decisions. It balances growth and capital preservation through systematic rule-based execution.

## Entry Rules
- **Confirmation:** Wait for primary indicators and volume confirmation before taking a position.
- **Valuation / Trigger:** Ensure the market price aligns with fundamental margin of safety or technical breakout levels.
- **Favorable Risk/Reward:** Target a minimum risk-to-reward ratio of 1:2 prior to entry.

## Exit Rules
- **Profit Target:** Scale out 50% of the position at the first key resistance or intrinsic valuation milestone.
- **Trailing Stop:** Trail the remaining position behind dynamic support levels (e.g., 20/44 moving averages or trailing stops).
- **Invalidation:** Exit immediately without hesitation if the trade premise or stop loss is breached.

## Risk Management
- Limit maximum loss per trade to 1% to 2% of total portfolio capital.
- Position size systematically using calculated stop distance rather than emotional guessing.
- Maintain adequate liquidity and emergency cash reserves to avoid panic selling during volatility.

## Pros & Cons
- **Pros:** Eliminates emotional bias, repeatable rules, robust capital protection over long market horizons.
- **Cons:** Requires strict discipline, can experience false breakouts or consolidation whip-saws in choppy markets.`;
}

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

    // 1. Try local Ollama first (tight 2.5s timeout)
    try {
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
          stream: false,
        }),
        signal: AbortSignal.timeout(2500),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const rawContent = data.response || '';
        const content = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        if (content && content.length > 50) {
          return NextResponse.json({ content, cached: false, provider: 'ollama', model: 'deepseek-r1:1.5b (Local)' });
        }
      }
    } catch {
      // Ollama not available / timed out, fall through to OpenRouter
    }

    // 2. Fallback to OpenRouter (Fast notes models first)
    if (OPENROUTER_API_KEY) {
      for (const model of FALLBACK_MODELS) {
        try {
          const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Campus OS FinSack Notes',
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt },
                ],
                max_tokens: 1200,
                temperature: 0.4,
              }),
              signal: AbortSignal.timeout(15000),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const msg = data.choices?.[0]?.message;
            const rawContent = msg?.content || msg?.reasoning || data.choices?.[0]?.text || '';
            const content = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            if (content && content.length > 50) {
              return NextResponse.json({ content, cached: false, provider: 'openrouter', model });
            }
          }
        } catch {
          continue;
        }
      }
    }

    // 3. Fallback to Curriculum Engine if cloud & local are down
    const fallbackNotes = generateFallbackNotes(strategyId, prompt);
    return NextResponse.json({
      content: fallbackNotes,
      cached: false,
      provider: 'curriculum',
      model: 'Curriculum Engine (Offline Safe)',
    });
  } catch (error) {
    console.error('Notes API error:', error);
    const fallbackNotes = generateFallbackNotes('strategy', 'financial fundamentals');
    return NextResponse.json({
      content: fallbackNotes,
      cached: false,
      provider: 'curriculum',
      model: 'Curriculum Engine (Recovery)',
    });
  }
}
