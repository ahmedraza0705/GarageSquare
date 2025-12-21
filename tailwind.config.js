/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc2fb',
          400: '#4682B4', // Steel Blue (Base)
          500: '#3a6c95',
          600: '#2e5677',
          700: '#234059',
          800: '#172b3b',
          900: '#0b151d',
        },
        secondary: {
          50: '#fef9f0',
          100: '#fdf3e0',
          200: '#fbe6ba',
          300: '#f9d37c',
          400: '#D28D4D', // Orange/Tan (Base)
          500: '#ad723e',
          600: '#8c5c32',
          700: '#694526',
          800: '#462e19',
          900: '#23170d',
        },
      },
    },
  },
  plugins: [],
}

