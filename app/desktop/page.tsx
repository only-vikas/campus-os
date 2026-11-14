'use client';

// ============================================================
// Campus OS — Simulated Desktop Environment (/desktop)
// Flow: Boot → LockScreen → Desktop
// ============================================================
import { useEffect } from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import BootSequence from '@/components/desktop/BootSequence';
import LockScreen from '@/components/desktop/LockScreen';
import Desktop from '@/components/desktop/Desktop';

export default function DesktopPage() {
  const { isBooting, isLocked } = useDesktopStore();

  // Prevent default browser context menu on the simulated OS desktop
  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    return () => document.removeEventListener('contextmenu', prevent);
  }, []);

  if (isBooting) return <BootSequence />;
  if (isLocked) return <LockScreen />;
  return <Desktop />;
}

