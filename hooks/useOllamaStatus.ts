import { useState, useEffect } from 'react';

export type OllamaStatus = 'connected' | 'disconnected' | 'checking';

export function useOllamaStatus() {
  const [status, setStatus] = useState<OllamaStatus>('checking');

  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:11434/', { method: 'GET' });
        if (mounted) {
          setStatus(res.ok ? 'connected' : 'disconnected');
        }
      } catch (e) {
        if (mounted) {
          setStatus('disconnected');
        }
      }
    };

    // Initial check
    checkStatus();

    // Polling every 60 seconds
    const intervalId = setInterval(checkStatus, 60000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return status;
}
