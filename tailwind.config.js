/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "hockey-blue": "#1e40af",
        "hockey-red": "#dc2626",
        "wood-dark": "#3e2723",
        "wood-light": "#5d4037",
      },
      fontFamily: {
        game: ["Orbitron", "sans-serif"],
      },
    },
  },
  plugins: [],
};
