/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyphex: {
          950: '#060a12',
          900: '#0b1120',
          850: '#0f172a',
          800: '#162032',
          750: '#1c283f',
          700: '#23324c',
          600: '#334155',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'alert-fade': 'alertFade 0.3s ease-out forwards',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 14px rgba(6, 182, 212, 0.8))' },
        },
        alertFade: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'cyber-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.25), 0 0 6px -2px rgba(6, 182, 212, 0.2)',
        'cyber-red': '0 0 20px -3px rgba(239, 68, 68, 0.35), 0 0 8px -2px rgba(239, 68, 68, 0.3)',
        'cyber-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.25), 0 0 6px -2px rgba(16, 185, 129, 0.2)',
      },
    },
  },
  plugins: [],
}

