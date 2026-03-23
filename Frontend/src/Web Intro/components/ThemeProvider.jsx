import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('intro-theme');
    return saved || 'amoled';
  });

  const [systemTheme, setSystemTheme] = useState('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('intro-theme', theme);
    // NOTE: We no longer touch document.documentElement here.
    // The theme is applied directly to the WebIntro wrapper <div>
    // via effectiveTheme exposed from this context.
  }, [theme, systemTheme]);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  const themes = [
    { id: 'system', name: 'System', icon: '🖥️' },
    { id: 'light',  name: 'Light',  icon: '☀️' },
    { id: 'dark',   name: 'Dark',   icon: '🌙' },
    { id: 'amoled', name: 'AMOLED', icon: '⚫' },
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, systemTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};