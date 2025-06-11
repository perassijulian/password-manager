import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#3B82F6",
          dark: "#6845EB",
        },
        background: {
          light: "#FFFFFF",
          dark: "#040405",
        },
        letter: {
          light: "#1F2937",
          dark: "#676767",
        },
        border: {
          light: "#E5E7EB",
          dark: "#C3C3C3",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
