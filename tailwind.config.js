/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          green: '#25D366',
          dark: '#075E54',
          teal: '#128C7E',
          light: '#DCF8C6',
          bg: '#ECE5DD',
        }
      }
    },
  },
  plugins: [],
}
