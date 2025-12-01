/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Scientific theme colors (blue/purple gradient)
        scientific: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          indigo: '#6366f1',
        },
      },
      backgroundImage: {
        'gradient-scientific': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue-purple': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      },
    },
  },
  plugins: [],
}

