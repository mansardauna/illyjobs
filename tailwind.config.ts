import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        // Emerald scale. 500 is the primary brand colour and passes WCAG AA with white text.
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          500: "#047857",
          600: "#065f46",
          700: "#065f46",
          800: "#064e3b",
          900: "#064e3b",
        },
      },
      borderRadius: {
        sm: "0.25rem", // Crisp rounded-sm (4px)
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
