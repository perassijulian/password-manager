"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const stored = localStorage.getItem("theme");

    if (stored === "dark") {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const isDarkMode = root.classList.contains("dark");

    if (isDarkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition"
      title="Toggle Dark Mode"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
