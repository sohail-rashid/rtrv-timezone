import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { applyColorTheme, getDefaultColorTheme } from '../utils/themes';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colorTheme: string;
  setColorTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('world-clock-theme') as Theme;
      return stored || 'system';
    }
    return 'system';
  });

  const [colorTheme, setColorThemeState] = useState<string>(() => getDefaultColorTheme());

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  });

  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    
    localStorage.setItem('world-clock-theme', theme);
    applyColorTheme(colorTheme, resolved);
  }, [theme, colorTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const newTheme = getSystemTheme();
      setResolvedTheme(newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      applyColorTheme(colorTheme, newTheme);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, colorTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColorTheme = (id: string) => {
    setColorThemeState(id);
    localStorage.setItem('world-clock-color-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
