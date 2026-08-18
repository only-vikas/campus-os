// ============================================================
// Campus OS — useQuotes Hook
// Manages: ZenQuotes API fetch, 3-min rotation, cache, fallback
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';

interface Quote {
  quote: string;
  author: string;
}

const CACHE_KEY = 'campus-os-quotes-cache';
const ROTATION_INTERVAL = 3 * 60 * 1000; // 3 minutes

// 30 hardcoded fallback quotes
const FALLBACK_QUOTES: Quote[] = [
  { quote: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { quote: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { quote: 'Great things never come from comfort zones.', author: 'Unknown' },
  { quote: 'Dream it. Wish it. Do it.', author: 'Unknown' },
  { quote: "Success doesn't just find you. You have to go out and get it.", author: 'Unknown' },
  { quote: 'Small steps in the right direction can turn out to be the biggest step of your life.', author: 'Unknown' },
  { quote: "Believe you can and you're halfway there.", author: 'Theodore Roosevelt' },
  { quote: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { quote: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { quote: 'Everything you can imagine is real.', author: 'Pablo Picasso' },
  { quote: 'What you get by achieving your goals is not as important as what you become.', author: 'Zig Ziglar' },
  { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { quote: 'Your limitation—it\'s only your imagination.', author: 'Unknown' },
  { quote: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: 'Unknown' },
  { quote: 'Wake up with determination. Go to bed with satisfaction.', author: 'Unknown' },
  { quote: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { quote: 'Little things make big days.', author: 'Unknown' },
  { quote: "It's going to be hard, but hard does not mean impossible.", author: 'Unknown' },
  { quote: "Don't wait for opportunity. Create it.", author: 'Unknown' },
  { quote: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  { quote: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { quote: 'Education is the passport to the future.', author: 'Malcolm X' },
  { quote: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { quote: 'Knowledge is power.', author: 'Francis Bacon' },
  { quote: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { quote: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { quote: 'The roots of education are bitter, but the fruit is sweet.', author: 'Aristotle' },
  { quote: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { quote: 'What we know is a drop, what we don\'t know is an ocean.', author: 'Isaac Newton' },
  { quote: 'The mind is not a vessel to be filled, but a fire to be kindled.', author: 'Plutarch' },
];

function getCachedQuotes(): Quote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function setCachedQuotes(quotes: Quote[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(quotes));
  } catch {}
}

export function useQuotes() {
  const [currentQuote, setCurrentQuote] = useState<Quote>({ quote: '', author: '' });
  const [isLoading, setIsLoading] = useState(true);
  const quoteVersion = useDesktopStore((s) => s.quoteVersion);
  const cacheRef = useRef<Quote[]>([]);
  const fetchingRef = useRef(false);

  // Fetch quotes from API
  const fetchQuotes = useCallback(async (): Promise<Quote[]> => {
    if (fetchingRef.current) return [];
    fetchingRef.current = true;
    try {
      const res = await fetch('/api/quotes');
      const data = await res.json();
      if (data.ok && data.quotes.length > 0) {
        fetchingRef.current = false;
        return data.quotes;
      }
    } catch (err) {
      console.warn('Quote API error, using fallback:', err);
    }
    fetchingRef.current = false;
    return [...FALLBACK_QUOTES];
  }, []);

  // Pick a random quote from cache, remove it
  const pickQuote = useCallback(async () => {
    // If cache is empty, refill
    if (cacheRef.current.length === 0) {
      const cached = getCachedQuotes();
      if (cached.length > 0) {
        cacheRef.current = cached;
      } else {
        setIsLoading(true);
        const fetched = await fetchQuotes();
        cacheRef.current = fetched;
      }
    }

    // Still empty? Use fallback
    if (cacheRef.current.length === 0) {
      cacheRef.current = [...FALLBACK_QUOTES];
    }

    // Pick random and remove
    const idx = Math.floor(Math.random() * cacheRef.current.length);
    const picked = cacheRef.current[idx];
    cacheRef.current.splice(idx, 1);

    // Save remaining to cache
    setCachedQuotes(cacheRef.current);

    setCurrentQuote(picked);
    setIsLoading(false);
  }, [fetchQuotes]);

  // Initial load + on quoteVersion change (lock/unlock/restart)
  useEffect(() => {
    pickQuote();
  }, [quoteVersion, pickQuote]);

  // Auto-rotate every 3 minutes
  useEffect(() => {
    const interval = setInterval(pickQuote, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [pickQuote]);

  return { quote: currentQuote.quote, author: currentQuote.author, isLoading };
}
