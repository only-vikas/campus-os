'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export default function AreaChart({ 
  data, 
  width = 600, 
  height = 200, 
  color = '#34d399' 
}: AreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    // X axis
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    // Y axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Draw data line & area
    ctx.beginPath();
    const startX = padding.left;
    const startY = height - padding.bottom - (data[0].value / maxValue) * chartHeight;
    ctx.moveTo(startX, startY);

    const points = data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
      y: height - padding.bottom - (d.value / maxValue) * chartHeight
    }));

    points.forEach(p => ctx.lineTo(p.x, p.y));

    // Stroke line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, `${color}40`); // 25% opacity
    gradient.addColorStop(1, `${color}00`); // 0% opacity
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    // X labels (first and last)
    if (data.length > 0) {
      ctx.fillText(data[0].label, padding.left, height - padding.bottom + 15);
      ctx.fillText(data[data.length - 1].label, width - padding.right, height - padding.bottom + 15);
    }
    
    // Y labels (max and 0)
    ctx.textAlign = 'right';
    ctx.fillText('0', padding.left - 5, height - padding.bottom + 3);
    ctx.fillText(Math.round(maxValue).toString(), padding.left - 5, padding.top + 3);

  }, [data, width, height, color]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
}
