/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        bg: 'oklch(0.08 0.025 275)',
        bg2: 'oklch(0.11 0.025 275)',
        bg3: 'oklch(0.15 0.03 275)',
        surface: 'oklch(0.14 0.03 275)',
        border: 'oklch(0.22 0.03 275)',
        lime: 'oklch(0.82 0.22 145)',
        violet: 'oklch(0.65 0.22 310)',
        coral: 'oklch(0.72 0.22 25)',
        sky: 'oklch(0.72 0.18 225)',
        text: 'oklch(0.95 0.01 275)',
        text2: 'oklch(0.60 0.03 275)',
        text3: 'oklch(0.38 0.03 275)',
      }
    },
  },
  plugins: [],
}
