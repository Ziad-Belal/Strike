/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#000000",
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#cfcfcf",
          300: "#b1b1b1",
          400: "#8f8f8f",
          500: "#6f6f6f",
          600: "#4b4b4b",
          700: "#2f2f2f",
          800: "#1a1a1a",
          900: "#0a0a0a"
        }
      },
      borderRadius: {
        'xl2': '1.25rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,.06)"
      }
    },
  },
  plugins: [],
}
