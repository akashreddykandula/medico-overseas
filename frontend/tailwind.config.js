/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1F3864',
          50: '#EAF0FA',
          100: '#CFDCF0',
          200: '#9FB9E1',
          300: '#6F96D2',
          400: '#3F73C3',
          500: '#2A5498',
          600: '#1F3864',
          700: '#182B4D',
          800: '#111E36',
          900: '#0A111F',
        },
        coral: {
          DEFAULT: '#E15B3F',
          50: '#FDEEEA',
          100: '#FBD6CB',
          200: '#F6AD97',
          300: '#F18463',
          400: '#EC5D3F',
          500: '#E15B3F',
          600: '#C24629',
          700: '#973620',
          800: '#6C2617',
          900: '#41160E',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-navy': 'radial-gradient(at 20% 20%, #2A5498 0px, transparent 50%), radial-gradient(at 80% 80%, #1F3864 0px, transparent 50%)',
        'mesh-coral': 'radial-gradient(at 30% 30%, #F18463 0px, transparent 50%), radial-gradient(at 70% 70%, #E15B3F 0px, transparent 50%)',
      },
      boxShadow: {
        glow: '0 8px 40px -8px rgba(31, 56, 100, 0.35)',
        'glow-coral': '0 8px 40px -8px rgba(225, 91, 63, 0.35)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
    },
  },
  plugins: [],
};
