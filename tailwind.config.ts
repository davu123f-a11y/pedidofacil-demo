import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edfdf5",
          100: "#d3f8e4",
          500: "#18a76b",
          600: "#0f8f5b",
          700: "#0b7049",
          900: "#06432f"
        },
        orangeSoft: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c"
        },
        ink: "#17211c"
      },
      boxShadow: {
        soft: "0 14px 45px rgba(15, 23, 42, 0.08)",
        card: "0 10px 30px rgba(15, 23, 42, 0.06)"
      }
    },
  },
  plugins: [],
};

export default config;
