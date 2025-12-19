'use client';

import { useThemeStore } from '@/lib/store/theme-store';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, initTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    initTheme();
  }, [initTheme]);

  // Apply theme changes
  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Also update color-scheme for better native element support
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
