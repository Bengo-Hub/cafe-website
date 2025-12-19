import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Apply theme immediately
          if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(newTheme);
          }
          return { theme: newTheme };
        }),
      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme immediately
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      },
      initTheme: () => {
        // Initialize theme based on system preference or saved preference
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          const savedTheme = localStorage.getItem('theme-storage');
          let theme: Theme = 'light';

          if (savedTheme) {
            try {
              const parsed = JSON.parse(savedTheme);
              theme = parsed.state?.theme || 'light';
            } catch {
              theme = 'light';
            }
          } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'dark';
          }

          root.classList.remove('light', 'dark');
          root.classList.add(theme);
          set({ theme });
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
