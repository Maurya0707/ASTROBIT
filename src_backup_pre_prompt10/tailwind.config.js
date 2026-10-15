/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#090a0d',
          900: '#101114',
          850: '#15161a',
          800: '#1a1c22',
          750: '#20222a',
          700: '#282a34',
          600: '#343744',
          500: '#464a5c',
        },
        cosmic: {
          cyan: '#00f0ff',
          blue: '#38bdf8',
          orange: '#ff6b00',
          amber: '#fbbf24',
          emerald: '#10b981',
          purple: '#a855f7',
          pink: '#f43f5e',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"Silkscreen"', 'monospace'],
        terminal: ['"VT323"', 'monospace'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 16px -2px rgba(0, 240, 255, 0.4)',
        'glow-orange': '0 0 16px -2px rgba(255, 107, 0, 0.4)',
        'glow-emerald': '0 0 16px -2px rgba(16, 185, 129, 0.4)',
        'glow-purple': '0 0 16px -2px rgba(168, 85, 247, 0.4)',
        'hud': '0 4px 20px 0 rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.08)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
