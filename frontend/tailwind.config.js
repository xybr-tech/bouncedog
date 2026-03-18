/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#e63946',
          600: '#c41e1e',
          700: '#a11d1d',
          800: '#831818',
          900: '#6b1414',
        },
        dog: {
          50: '#f8f8f8',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#4a4a4a',
          600: '#3a3a3a',
          700: '#2d2d2d',
          800: '#1f1f1f',
          900: '#141414',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbf71',
          400: '#d4760a',
          500: '#c26a09',
          600: '#a35708',
          700: '#854507',
          800: '#6b3706',
          900: '#5a2e05',
        },
      },
    },
  },
  plugins: [],
};
