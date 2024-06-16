/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#F25C78',
        'secondary': '#BF4B81',
        'accent': '#62238C',
        'background': '#F2D1B3',
        'dark': '#0D0D0D',
      },
    },
  },
  plugins: [],
}
