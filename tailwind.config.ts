import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./stores/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./types/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Academy — Campus OS Core
        campus: {
          bg: '#0A0C10',
          surface1: '#111318',
          surface2: '#181C24',
          surface3: '#1E2330',
          border: {
            subtle: 'rgba(255, 255, 255, 0.06)',
            medium: 'rgba(255, 255, 255, 0.12)',
            glow: 'rgba(99, 102, 241, 0.3)',
          },
          text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
            muted: '#475569',
          },
          indigo: '#6366F1',
          cyan: '#22D3EE',
          emerald: '#34D399',
          amber: '#F59E0B',
          violet: '#A78BFA',
          orange: '#FB923C',
          pink: '#F472B6',
          sky: '#38BDF8',
        },
        // Backward-compatible OS tokens
        'os-bg':        '#0f172a',
        'os-primary':   '#60a5fa',
        'os-secondary': '#a78bfa',
        'os-success':   '#34d399',
        'os-warning':   '#fbbf24',
        'os-danger':    '#f472b6',
        'os-text-1':    '#e2e8f0',
        'os-text-2':    '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        os: '12px',
        glass: '20px',
      },
      boxShadow: {
        'glass-card': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'neu-outer': '-6px -6px 14px rgba(255, 255, 255, 0.03), 6px 6px 14px rgba(0, 0, 0, 0.6)',
        'neu-inner': 'inset -4px -4px 8px rgba(255, 255, 255, 0.03), inset 4px 4px 8px rgba(0, 0, 0, 0.6)',
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 24px rgba(34, 211, 238, 0.35)',
        'glow-emerald': '0 0 24px rgba(52, 211, 153, 0.35)',
      },
      animation: {
        'spin-slow':   'spin-slow 8s linear infinite',
        'pulse-ring':  'pulse-ring 2s ease-in-out infinite',
        'blink':       'blink 1s step-end infinite',
        'float-slow':  'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
