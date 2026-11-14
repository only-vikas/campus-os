'use client';

// ============================================================
// Campus OS — Reusable Shimmer Skeleton Loaders
// Deep Space Academy Surface Layers (#181C24 → #1E2330)
// ============================================================
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'card' | 'badge' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'default',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'badge':
        return 'rounded-md h-5 w-16';
      case 'button':
        return 'rounded-xl h-10 w-28';
      case 'card':
        return 'rounded-2xl p-4 h-36 w-full';
      case 'text':
        return 'rounded h-4 w-full';
      default:
        return 'rounded-xl';
    }
  };

  const inlineStyles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-[#181C24] via-[#1E2330] to-[#181C24] animate-pulse border border-white/[0.04] ${getVariantStyles()} ${className}`}
      style={inlineStyles}
      {...props}
    >
      {/* Moving Shimmer Reflection */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}

// Multi-line Text Skeleton
export function SkeletonText({
  lines = 3,
  className = '',
  gap = 'gap-2',
}: {
  lines?: number;
  className?: string;
  gap?: string;
}) {
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-4/5' : i === 0 ? 'w-full' : 'w-11/12'}
        />
      ))}
    </div>
  );
}

// Profile/Avatar Skeleton with Text lines
export function SkeletonAvatarCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl glass-panel ${className}`}>
      <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/2 h-4" />
        <Skeleton variant="text" className="w-3/4 h-3" />
      </div>
    </div>
  );
}

// Bento Feature Card Skeleton
export function SkeletonBentoCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-panel rounded-3xl p-6 space-y-4 border border-white/5 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" className="w-10 h-10" />
        <Skeleton variant="badge" />
      </div>
      <Skeleton variant="text" className="w-2/3 h-6" />
      <SkeletonText lines={2} />
      <Skeleton className="h-16 w-full rounded-xl mt-4" />
    </div>
  );
}

export default Skeleton;

