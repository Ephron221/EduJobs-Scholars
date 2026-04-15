import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('edujobs-theme');
  if (saved) return saved === 'dark';
  // Default to dark (original design), unless user prefers light
  return !window.matchMedia('(prefers-color-scheme: light)').matches;
};

const applyTheme = (dark: boolean) => {
  const html = document.documentElement;
  const root = document.getElementById('app-root');

  if (dark) {
    html.classList.add('dark');
    html.classList.remove('light');
    // Force background on html and body for full coverage
    html.style.backgroundColor = '#030712'; // gray-950
    html.style.color = '#f9fafb';
    if (root) {
      root.style.backgroundColor = '#030712';
      root.style.color = '#f9fafb';
    }
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    html.style.backgroundColor = '#ffffff';
    html.style.color = '#111827';
    if (root) {
      root.style.backgroundColor = '#ffffff';
      root.style.color = '#111827';
    }
  }
};

// Apply immediately to prevent flash
applyTheme(getInitialTheme());

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    applyTheme(isDarkMode);
    localStorage.setItem('edujobs-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
