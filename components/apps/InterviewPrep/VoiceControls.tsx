'use client';
// ============================================================
// Interview Prep — Voice Controls
// Mic toggle, speaker toggle, waveform, and status
// ============================================================
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { isSTTSupported, isTTSSupported } from '@/services/voiceService';
import Waveform from './Waveform';

interface VoiceControlsProps {
  voiceEnabled: boolean;
  ttsEnabled: boolean;
  isRecording: boolean;
  onToggleVoice: () => void;
  onToggleTTS: () => void;
  onToggleTextMode: () => void;
}

export default function VoiceControls({
  voiceEnabled,
  ttsEnabled,
  isRecording,
  onToggleVoice,
  onToggleTTS,
  onToggleTextMode,
}: VoiceControlsProps) {
  const sttAvailable = isSTTSupported();
  const ttsAvailable = isTTSSupported();

  return (
    <div className="flex items-center gap-3">
      {/* Mic Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onToggleVoice}
        disabled={!sttAvailable}
        title={!sttAvailable ? 'Speech recognition not supported' : voiceEnabled ? 'Disable mic' : 'Enable mic'}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
            : voiceEnabled
            ? 'bg-[#60a5fa]/20 border border-[#60a5fa]/40 text-[#60a5fa]'
            : 'bg-[#1e293b] border border-[#334155] text-[#64748b]'
        } ${!sttAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'}`}
      >
        {isRecording ? (
          <>
            <MicOff size={16} />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </>
        ) : (
          <Mic size={16} />
        )}
      </motion.button>

      {/* Speaker Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onToggleTTS}
        disabled={!ttsAvailable}
        title={ttsEnabled ? 'Mute AI voice' : 'Enable AI voice'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          ttsEnabled
            ? 'bg-[#a78bfa]/20 border border-[#a78bfa]/40 text-[#a78bfa]'
            : 'bg-[#1e293b] border border-[#334155] text-[#64748b]'
        } ${!ttsAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'}`}
      >
        {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </motion.button>

      {/* Waveform (only show when recording) */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 100 }}
          exit={{ opacity: 0, width: 0 }}
          className="overflow-hidden"
        >
          <Waveform isActive={isRecording} color="#f87171" height={28} />
        </motion.div>
      )}

      {/* Text mode toggle */}
      <button
        onClick={onToggleTextMode}
        title="Switch to text input"
        className="text-[10px] text-[#64748b] hover:text-[#94a3b8] flex items-center gap-1 transition-colors"
      >
        <Keyboard size={12} />
        Type instead
      </button>
    </div>
  );
}
