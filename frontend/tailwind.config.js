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
        recon: {
          light: {
            bg: '#F5F6F2',
            card: '#FFFFFF',
            text: '#1C2B26',
            muted: '#6B7470',
            border: '#E7E9E5',
            soft: '#E5F0EA',
          },
          dark: {
            bg: '#101613',
            sidebar: '#111A16',
            card: '#18221D',
            cardHover: '#1D2822',
            text: '#F3F5F2',
            muted: '#9CA8A1',
            border: '#2A3730',
            accent: '#4F9B78',
          },
          forest: '#174A3A',
          forestHover: '#133E31',
          sage: '#2F6B57',
          mint: '#E5F0EA',
          risk: {
            critical: '#D9534F',
            high: '#E58A3A',
            medium: '#D4A72C',
            low: '#4C8F70',
            success: '#2F7D5A',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(28, 43, 38, 0.04), 0 2px 6px -1px rgba(28, 43, 38, 0.02)',
        'soft-hover': '0 10px 30px -4px rgba(28, 43, 38, 0.08), 0 4px 12px -2px rgba(28, 43, 38, 0.03)',
        'dark-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
