'use client';
// ============================================================
// Interview Prep — Radar Chart (Pure Canvas)
// 6-dimension skill visualization
// ============================================================
import { useEffect, useRef } from 'react';
import { DimensionScore } from '@/stores/useInterviewStore';

interface RadarChartProps {
  dimensions: DimensionScore;
  size?: number;
}

const LABELS = [
  'Communication',
  'Technical',
  'Problem Solving',
  'Cultural Fit',
  'Confidence',
  'STAR Usage',
];

const KEYS: (keyof DimensionScore)[] = [
  'communication',
  'technicalDepth',
  'problemSolving',
  'culturalFit',
  'confidence',
  'starUsage',
];

export default function RadarChart({ dimensions, size = 200 }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.38;
    const n = 6;
    const angle = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, size, size);

    // Draw concentric rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (maxR * ring) / 4;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = angle * i - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ring === 4 ? '#334155' : '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < n; i++) {
      const a = angle * i - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const val = dimensions[KEYS[i]] / 100;
      const r = val * maxR;
      const a = angle * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < n; i++) {
      const val = dimensions[KEYS[i]] / 100;
      const r = val * maxR;
      const a = angle * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#60a5fa';
      ctx.fill();
    }

    // Draw labels
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    for (let i = 0; i < n; i++) {
      const a = angle * i - Math.PI / 2;
      const labelR = maxR + 18;
      const x = cx + Math.cos(a) * labelR;
      const y = cy + Math.sin(a) * labelR;
      ctx.fillText(LABELS[i], x, y + 3);
    }
  }, [dimensions, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="mx-auto"
      style={{ width: size, height: size }}
    />
  );
}
