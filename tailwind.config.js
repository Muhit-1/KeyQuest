/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#146C94',
        secondary: '#19A7CE',
        accent: '#AFD3E2',
        background: '#F6F1F1',
      },
      fontFamily: {
        'mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      animation: {
        'key-press': 'keyPress 0.2s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        keyPress: {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgb(20, 108, 148)' },
          '50%': { transform: 'scale(0.95)', backgroundColor: 'rgb(25, 167, 206)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'rgb(20, 108, 148)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
