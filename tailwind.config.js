/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './pages/**/*.{html,js}',
    './scripts/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          foreground: '#f8fafc',
          muted: '#1d4ed8'
        }
      },
      boxShadow: {
        focus: '0 0 0 4px rgba(59, 130, 246, 0.35)'
      },
      borderRadius: {
        '3xl': '1.75rem'
      }
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem'
      }
    }
  }
};
