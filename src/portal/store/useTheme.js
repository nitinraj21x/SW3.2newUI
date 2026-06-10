import { create } from 'zustand';

const STORAGE_KEY = 'cp_theme';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark'; // SSR / storage unavailable fallback
  }
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

// Apply once at module load to avoid flash — read theme from storage immediately
const _initial = getInitialTheme();
applyTheme(_initial);

const useTheme = create((set) => ({
  theme: _initial,  // reuse already-computed value

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
