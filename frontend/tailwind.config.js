/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#060709',
          900: '#09090b',
          850: '#0e1015',
          800: '#14171f',
          700: '#1d222d',
        },
        sentinel: {
          cyan: '#00f0ff',
          red: '#ff3366',
          orange: '#ff9900',
          purple: '#a855f7',
          emerald: '#10b981',
          slate: '#1e2430'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'glow-red': '0 0 25px rgba(255, 51, 102, 0.6)',
        'control-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.04)' }
        },
        radarScan: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'pulse-fast': 'pulseFast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-scan': 'radarScan 4s linear infinite'
      }
    },
  },
  plugins: [],
}
