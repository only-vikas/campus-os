'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  thickness?: number;
}

export default function DonutChart({ data, size = 200, thickness = 30 }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      // Draw empty state
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - thickness / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = thickness;
      ctx.stroke();
      return;
    }

    let startAngle = -0.5 * Math.PI; // Start at top
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - thickness / 2, startAngle, startAngle + sliceAngle);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = thickness;
      ctx.stroke();
      
      startAngle += sliceAngle;
    });

  }, [data, size, thickness]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
