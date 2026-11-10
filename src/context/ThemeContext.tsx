import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

export type AmbientTheme = 'midnight' | 'sunset';

interface ThemeContextType {
  theme: AmbientTheme;
  toggleTheme: () => void;
  setTheme: (theme: AmbientTheme) => void;
  isSunset: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'apex_velocity_ambient_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AmbientTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as AmbientTheme;
        if (saved === 'midnight' || saved === 'sunset') {
          return saved;
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return 'midnight';
  });

  const applyThemeClasses = useCallback((newTheme: AmbientTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (newTheme === 'sunset') {
      root.classList.remove('theme-midnight');
      root.classList.add('theme-sunset');
      root.setAttribute('data-theme', 'sunset');
    } else {
      root.classList.remove('theme-sunset');
      root.classList.add('theme-midnight');
      root.setAttribute('data-theme', 'midnight');
    }
  }, []);

  useEffect(() => {
    applyThemeClasses(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage error
    }
  }, [theme, applyThemeClasses]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'midnight' ? 'sunset' : 'midnight';
      triggerHaptic('light');
      return nextTheme;
    });
  }, []);

  const setTheme = useCallback((newTheme: AmbientTheme) => {
    setThemeState(newTheme);
    triggerHaptic('light');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isSunset: theme === 'sunset',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
