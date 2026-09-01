import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// In-memory cache for search results (saves API quota)
const searchCache = new Map<
  string,
  { videoId: string; title: string; thumbnail: string; timestamp: number }
>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');

  if (!q) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  // 1. Check in-memory cache
  const cached = searchCache.get(q);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      videoId: cached.videoId,
      title: cached.title,
      thumbnail: cached.thumbnail,
      cached: true,
    });
  }

  // 2. If no API key, return error (FinLearn will fall back to defaultVideoId)
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key not configured' },
      { status: 503 }
    );
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', q);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('order', 'relevance');
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('key', YOUTUBE_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errText = await response.text();
      console.error('YouTube API error:', response.status, errText);
      return NextResponse.json(
        { error: 'YouTube API error', status: response.status },
        { status: 502 }
      );
    }

    const data = await response.json();
    const item = data.items?.[0];

    if (!item) {
      return NextResponse.json(
        { error: 'No embeddable video results found' },
        { status: 404 }
      );
    }

    const result = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url,
    };

    // Store in cache
    searchCache.set(q, { ...result, timestamp: Date.now() });

    return NextResponse.json({ ...result, cached: false });
  } catch (error: any) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    );
  }
}
