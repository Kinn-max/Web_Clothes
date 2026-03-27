/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    './node_modules/@left4code/tw-starter/dist/js/**/*.js',
    './node_modules/@left4code/tw-starter/dist/css/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        'glow-primary': {
          DEFAULT: '#FAD4D8', // Soft Pink
          50: '#FEF2F4',
          100: '#FDE6E9',
          200: '#FAD4D8',
          300: '#F6B2B9',
          400: '#F28F9A',
          500: '#E85D6F',
          600: '#D63D53',
          700: '#B6293D',
          800: '#951E2F',
          900: '#7A1625',
        },
        'glow-secondary': {
          DEFAULT: '#D4AF37', // Gold
          100: '#F4E7BD',
          200: '#EED995',
          300: '#E6C96C',
          400: '#D4AF37',
          500: '#AA8C2C',
          600: '#806921',
        },
        'glow-bg': '#FFFCFC', // Very light pink/white background
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

