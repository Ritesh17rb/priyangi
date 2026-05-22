/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: '#FF6B9D', light: '#FFB3D1', pale: '#FFF0F7' },
        purple: { DEFAULT: '#C77DFF', light: '#E8B4FF' },
        cream: '#FFF5FB',
        ink: '#3D1A47',
        'ink-light': '#9B6AAE',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
        body: ['Quicksand', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 32px rgba(199,125,255,0.18)',
        pinky: '0 8px 24px rgba(255,107,157,0.25)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%,100%': { color: '#FF6B9D' },
          '50%': { color: '#C77DFF' },
        },
      },
    },
  },
  plugins: [],
};
