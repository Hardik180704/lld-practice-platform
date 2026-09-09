"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem("designloop-theme", nextTheme);
  }

  return (
    <button
      aria-label="Toggle color theme"
      className="theme-toggle"
      onClick={toggleTheme}
      title="Toggle color theme"
      type="button"
    >
      <Moon className="theme-icon-moon" size={17} />
      <Sun className="theme-icon-sun" size={17} />
    </button>
  );
}
