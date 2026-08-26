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
        sans: ["Poppins", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["'DM Sans'", "Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f4faf0",
          100: "#e5f4dc",
          200: "#cce8bb",
          500: "#6FBE44", // Primary Fresh Green requested by user
          600: "#5fa838", // Hover state
          700: "#4c8c2b",
          800: "#3d7023",
          900: "#2d541a",
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
