import { createContext, useContext, useEffect, useState } from 'react';

// Create ThemeContext to share theme state across components
const ThemeContext = createContext();

// Provider to wrap around your app
export const ThemeProvider = ({ children }) => {
  // Load saved theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply theme class to HTML element and persist to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Toggle between light and dark modes
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);


