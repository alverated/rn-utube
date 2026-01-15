/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // YouTube brand colors
        youtube: {
          red: '#FF0000',
          dark: '#282828',
          darker: '#0F0F0F',
          light: '#F9F9F9',
          gray: '#AAAAAA',
        },
      },
    },
  },
  plugins: [],
}

