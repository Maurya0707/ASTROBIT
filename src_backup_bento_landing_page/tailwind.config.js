/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#000000',
          900: '#020617',
          850: '#030712',
          800: '#050b1a',
          750: '#0a1128',
          700: '#0f172a',
          600: '#1e293b',
        },
        charcoal: {
          950: '#030712',
          900: '#070b16',
          850: '#0b1120',
          800: '#111827',
          750: '#1e2538',
          700: '#283149',
          600: '#334155',
          500: '#475569',
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
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"Silkscreen"', 'monospace'],
        terminal: ['"VT323"', 'monospace'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.16)',
        'hud': '0 4px 20px 0 rgba(0, 0, 0, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.08)'
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
