"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "latte" | "mocha";

const STORAGE_KEY = "kosanku-theme";
const THEME_CHANGE_EVENT = "kosanku-theme-change";

function readTheme(): Theme {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "latte" || savedTheme === "mocha") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "mocha" : "latte";
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
  return "latte";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("latte", "mocha");
  root.classList.add(theme);
  root.style.colorScheme = theme === "mocha" ? "dark" : "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, getServerTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "mocha" ? "latte" : "mocha";
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const nextThemeLabel = theme === "mocha" ? "Latte" : "Mocha";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Ganti ke tema ${nextThemeLabel}`}
      aria-pressed={theme === "mocha"}
      title={`Ganti ke tema ${nextThemeLabel}`}
      className="fixed bottom-5 right-5 z-100 flex h-11 w-11 items-center justify-center rounded-full border border-ctp-surface0 bg-ctp-base text-ctp-text shadow-lg transition hover:bg-ctp-mantle"
    >
      {theme === "mocha" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}