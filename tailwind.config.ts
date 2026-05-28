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
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#FAF6EE",
          100: "#F4EBE1",
          200: "#EADEC9",
          300: "#D2C4A9",
          450: "#FAF3E0",
        },
        espresso: {
          50: "#F7F4F2",
          100: "#ECE5E0",
          250: "#D8CBC4",
          300: "#BAA59B",
          400: "#9B8074",
          500: "#7C5E53",
          600: "#5D4037",
          700: "#4E342E",
          800: "#3E2723",
          900: "#2C1A16",
          950: "#1A0F0D",
        },
        caramel: {
          400: "#F57C00",
          500: "#E65100",
          600: "#D84315",
          700: "#BF360C",
        },
        sage: {
          50: "#F1F8E9",
          100: "#DCEDC8",
          600: "#43A047",
          700: "#2E7D32",
          800: "#1B5E20",
        },
        gold: {
          400: "#e5c05c",
          500: "#d4af37",
          600: "#b5952f",
        },
      },
    },
  },
  plugins: [],
};
export default config;

