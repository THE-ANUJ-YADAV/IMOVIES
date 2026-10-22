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
        jet: '#0A0A0A',
        card: '#141414',
        elevated: '#1A1A1A',
        border: '#262626',
        cerulean: {
          DEFAULT: '#007BA7',
          hover: '#0090C4',
          dark: '#006285',
          light: '#23A1CE',
          glow: 'rgba(0, 123, 167, 0.4)',
        },
        rose: {
          neon: '#FF2D95',
          hover: '#FF4AAB',
          dark: '#D91776',
          glow: 'rgba(255, 45, 149, 0.35)',
        },
        muted: '#A3A3A3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cerulean': '0 0 20px -3px rgba(0, 123, 167, 0.35)',
        'rose': '0 0 20px -3px rgba(255, 45, 149, 0.35)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
