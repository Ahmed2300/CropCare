/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // emerald-600
        secondary: '#047857', // green-700
        accent: '#92400e', // amber-800
        'light-bg': '#fafaf9', // stone-50
        'base-text': '#44403c', // stone-700
        'subtle-text': '#78716c', // stone-500
        // You can add more shades or specific use-case colors here
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
