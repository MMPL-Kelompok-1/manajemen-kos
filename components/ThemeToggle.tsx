"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "kosanku-theme";
const THEME_CHANGE_EVENT = "kosanku-theme-change";

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "mocha") return "dark";
  if (savedTheme === "light" || savedTheme === "latte") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeToTheme(callback: () => void) {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };

  systemTheme.addEventListener("change", callback);
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    systemTheme.removeEventListener("change", callback);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getServerTheme(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "light-theme", "dark", "dark-theme", "latte", "mocha");
  if (theme === "dark") {
    root.classList.add("dark", "dark-theme");
    root.style.colorScheme = "dark";
  } else {
    root.classList.add("light", "light-theme");
    root.style.colorScheme = "light";
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, getServerTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const nextThemeLabel = theme === "dark" ? "Terang" : "Gelap";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Ganti ke tema ${nextThemeLabel}`}
      aria-pressed={theme === "dark"}
      title={`Ganti ke tema ${nextThemeLabel}`}
      className="fixed bottom-5 right-5 z-100 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:bg-muted"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}