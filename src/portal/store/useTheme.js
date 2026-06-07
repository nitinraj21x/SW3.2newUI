import { create } from 'zustand';

// Persist preference in localStorage
const STORAGE_KEY = 'cp_theme';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Respect OS preference on first visit
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

// Apply immediately (before first render) to avoid flash
applyTheme(getInitialTheme());

const useTheme = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return { theme: next };
    }),

  setTheme: (theme) =>
    set(() => {
      applyTheme(theme);
      return { theme };
    }),
}));

export default useTheme;
