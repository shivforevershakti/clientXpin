import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "high-contrast";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const STORAGE_KEY = "dynamic-engine-theme";

function readInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return stored ?? "dark";
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readInitialTheme(),
  setTheme: (t) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
    set({ theme: t });
  },
}));
