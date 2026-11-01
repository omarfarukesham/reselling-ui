import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm "teddy" caramel. Use 600+ for white-text buttons (passes WCAG AA contrast).
        brand: {
          50: "#fff8f1",
          100: "#fdebd8",
          200: "#f8d2ad",
          500: "#e07a2f",
          600: "#b4520f",
          700: "#923f0a",
        },
        cream: "#fffaf5",
      },
    },
  },
  plugins: [],
} satisfies Config;
