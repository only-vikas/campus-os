'use client';
// ============================================================
// Interview Prep — Waveform Visualization
// Canvas-based audio waveform for live mic feedback
// ============================================================
import { useEffect, useRef } from 'react';
import { getAnalyser } from '@/services/voiceService';

interface WaveformProps {
  isActive: boolean;
  color?: string;
  height?: number;
}

export default function Waveform({ isActive, color = '#60a5fa', height = 40 }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const analyser = getAnalyser();
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.stroke();
      } else {
        // Simulated idle wave
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `${color}40`;
        ctx.beginPath();
        const time = Date.now() / 1000;
        for (let x = 0; x < width; x++) {
          const y = h / 2 + Math.sin(x * 0.04 + time * 2) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className="w-full rounded-lg"
      style={{ height }}
    />
  );
}
