// ============================================================
// Campus OS — Voice Service
// Web Speech API wrapper: STT (SpeechRecognition) + TTS (SpeechSynthesis)
// Zero cost, browser-native, no external API required
// ============================================================

export interface VoiceCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd: () => void;
  onError: (error: string) => void;
  onFillerWord?: (word: string) => void;
}

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'actually'];

// ---- Speech-to-Text ----
let recognition: any = null;

export function isSTTSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startListening(callbacks: VoiceCallbacks): boolean {
  if (!isSTTSupported()) {
    callbacks.onError('Speech recognition is not supported in this browser.');
    return false;
  }

  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        // Check for filler words in final transcript
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

    if (finalTranscript) {
      callbacks.onResult(finalTranscript, true);
    } else if (interimTranscript) {
      callbacks.onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      callbacks.onError(`Speech recognition error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    callbacks.onEnd();
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
  if (recognition) {
    try {
      recognition.stop();
    } catch { /* already stopped */ }
    recognition = null;
  }
}

// ---- Text-to-Speech ----
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isTTSSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.speechSynthesis;
}

export function speak(text: string, onEnd?: () => void): void {
  if (!isTTSSupported()) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 0.9;

  // Try to get a natural-sounding English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
  }
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
    mediaStream.getTracks().forEach((track) => track.stop());
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
