/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#FEFAF0',
        'light-cream': '#F5F1E8',
        'dark-brown': '#2E0F13',
        'accent-red': '#913F4A',
        'light-pink': '#EAB9B3',
      },
      fontFamily: {
        'heading': ['Fraunces', 'Georgia', 'serif'],
        'paragraph': ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
