/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#071326',
          800: '#0A1E3F',
          700: '#102A56',
          600: '#183B75',
          500: '#23529E',
        },
        slate: {
          850: '#172033',
        },
        reg: {
          rbi: '#1E3A8A', // Deep Blue
          sebi: '#047857', // Emerald / Green
          certin: '#DC2626', // Crimson / Alert Red
          npci: '#D97706', // Amber / Gold
          irdai: '#4F46E5', // Indigo
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
