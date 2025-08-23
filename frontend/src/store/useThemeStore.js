import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("ClgVibe-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("ClgVibe-theme", theme);
    set({ theme });
  },
}));
