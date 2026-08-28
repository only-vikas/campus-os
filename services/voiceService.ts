// ============================================================
// Campus OS — Voice Service
// Web Speech API wrapper: STT (SpeechRecognition) + TTS (SpeechSynthesis)
// Internshala-style silence detection: auto-submit after 7-10s of silence
// Zero cost, browser-native, no external API required
// ============================================================

export interface VoiceCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onSilence: () => void;          // Triggered after silence threshold — caller should submit answer
  onEnd: () => void;
  onError: (error: string) => void;
  onFillerWord?: (word: string) => void;
  onSpeechStart?: () => void;     // Called when user actually starts speaking
}

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'actually'];
const SILENCE_THRESHOLD_MS = 8000; // 8 seconds of silence = auto-submit

// ---- Speech-to-Text ----
let recognition: any = null;
let silenceTimer: NodeJS.Timeout | null = null;
let hasSpokeAtLeastOnce = false;

export function isSTTSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

function clearSilenceTimer() {
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
}

function startSilenceTimer(callbacks: VoiceCallbacks) {
  clearSilenceTimer();
  silenceTimer = setTimeout(() => {
    // Only fire if user has spoken at least once (prevents instant trigger)
    if (hasSpokeAtLeastOnce) {
      stopListening();
      callbacks.onSilence();
    }
  }, SILENCE_THRESHOLD_MS);
}

export function startListening(callbacks: VoiceCallbacks): boolean {
  if (!isSTTSupported()) {
    callbacks.onError('Speech recognition is not supported in this browser.');
    return false;
  }

  hasSpokeAtLeastOnce = false;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // Start the initial silence timer — if user never speaks for 30s, stop
  silenceTimer = setTimeout(() => {
    if (!hasSpokeAtLeastOnce) stopListening();
  }, 30000);

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        // Check for filler words
        const words = transcript.toLowerCase().split(/\s+/);
        for (const word of words) {
          const cleanWord = word.replace(/[^a-z]/g, '');
          if (FILLER_WORDS.includes(cleanWord)) {
            callbacks.onFillerWord?.(cleanWord);
          }
        }
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript || interimTranscript) {
      if (!hasSpokeAtLeastOnce) {
        hasSpokeAtLeastOnce = true;
        callbacks.onSpeechStart?.();
      }
      // Reset silence timer every time we get new speech
      startSilenceTimer(callbacks);
    }

    if (finalTranscript) {
      callbacks.onResult(finalTranscript, true);
    } else if (interimTranscript) {
      callbacks.onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    if (event.error === 'no-speech') {
      // "no-speech" means SpeechRecognition timed out its own window — restart it
      if (recognition) {
        try { recognition.start(); } catch { /* already started */ }
      }
      return;
    }
    if (event.error !== 'aborted') {
      callbacks.onError(`Speech recognition error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    // If recognition ends unexpectedly (browser timeout), restart if still wanted
    if (recognition && hasSpokeAtLeastOnce) {
      try { recognition.start(); } catch { /* already started */ }
    } else {
      callbacks.onEnd();
    }
  };

  try {
    recognition.start();
    return true;
  } catch {
    callbacks.onError('Failed to start speech recognition.');
    return false;
  }
}

export function stopListening(): void {
  clearSilenceTimer();
  if (recognition) {
    try { recognition.stop(); } catch { /* already stopped */ }
    recognition = null;
  }
  hasSpokeAtLeastOnce = false;
}

export function isListening(): boolean {
  return recognition !== null;
}

// ---- Text-to-Speech ----
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isTTSSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.speechSynthesis;
}

export function speak(
  text: string,
  options?: { rate?: number; pitch?: number; voiceName?: string },
  onEnd?: () => void
): void {
  if (!isTTSSupported()) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = 0.9;

  const voices = window.speechSynthesis.getVoices();
  if (options?.voiceName) {
    const preferred = voices.find((v) => v.name.includes(options.voiceName!));
    if (preferred) utterance.voice = preferred;
  }

  if (!utterance.voice) {
    const fallback = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (fallback) utterance.voice = fallback;
  }

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  return window.speechSynthesis.speaking;
}

// ---- Audio Analyzer for Waveform ----
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let mediaStream: MediaStream | null = null;

export async function startAudioAnalyzer(): Promise<AnalyserNode | null> {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    return analyser;
  } catch {
    return null;
  }
}

export function stopAudioAnalyzer(): void {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyser = null;
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}
