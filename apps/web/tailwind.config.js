/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bbe5cb',
          300: '#8ed1a8',
          400: '#5cb681',
          500: '#3a9a64',
          600: '#287d50',
          700: '#216442',
          800: '#1d5037',
          900: '#19422e',
          950: '#0c2419',
        },
        accent: {
          50: '#fef7ec',
          100: '#fbeaca',
          200: '#f7d291',
          300: '#f3b558',
          400: '#f09b35',
          500: '#e97d1c',
          600: '#d35e15',
          700: '#af4514',
          800: '#8e3717',
          900: '#742e15',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
