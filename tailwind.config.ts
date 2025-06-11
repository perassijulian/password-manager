import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        border: "var(--color-border)",
        "primary-foreground": "var(--color-primary-foreground)",
        "foreground-secondary": "var(--color-foreground-secondary)",
        "background-secondary": "var(--color-background-secondary)",
        "background-terciary": "var(--color-background-terciary)",
      },
    },
  },
  plugins: [],
} satisfies Config;
