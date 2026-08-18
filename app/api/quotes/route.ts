// ============================================================
// Campus OS — Quotes API Route (CORS Proxy for ZenQuotes)
// GET /api/quotes → returns array of quotes
// ============================================================
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://zenquotes.io/api/quotes', {
      next: { revalidate: 300 }, // Cache server-side for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`ZenQuotes API error: ${res.status}`);
    }

    const data = await res.json();

    // ZenQuotes returns array of { q: string, a: string, h: string }
    const quotes = data
      .filter((item: { q: string; a: string }) => item.q && item.a)
      .map((item: { q: string; a: string }) => ({
        quote: item.q,
        author: item.a,
      }));

    return NextResponse.json({ quotes, ok: true });
  } catch (error) {
    console.error('Quote fetch error:', error);
    return NextResponse.json({ quotes: [], ok: false, error: 'Failed to fetch quotes' });
  }
}
