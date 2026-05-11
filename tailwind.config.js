/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ag-red': '#e30613',
        'ag-red-dark': '#a80310',
        'ag-black': '#080808',
        'ag-dark': '#111111',
        'ag-card': '#1c1c1c',
        'ag-gray': '#888888',
      },
      fontFamily: {
        barlow: ['Barlow', 'sans-serif'],
        'barlow-condensed': ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
}