/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          yellow: '#F5B000',
          yellowLight: '#FFF8E1',
          teal: '#00A896',
          tealLight: '#E6F7F5',
          dark: '#1E293B',
          gray: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
