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
          400: '#C37125', // Autumn Orange (Base)
          500: '#ad723e',
          600: '#8c5c32',
          700: '#694526',
          800: '#462e19',
          900: '#23170d',
        },
        accent: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        neutral: {
          900: '#1F2937', // Text Primary
          600: '#64748B', // Text Secondary
          200: '#E2E8F0', // Border/Divider
          100: '#F1F5F9', // Background
        }
      },
      fontFamily: {
        ubuntu: ['Ubuntu-Regular'],
        'ubuntu-bold': ['Ubuntu-Bold'],
        'ubuntu-medium': ['Ubuntu-Medium'],
        'ubuntu-light': ['Ubuntu-Light'],
        inter: ['Inter-Regular'],
        'inter-bold': ['Inter-Bold'],
        'inter-medium': ['Inter-Medium'],
      },
    },
  },
  plugins: [],
}

