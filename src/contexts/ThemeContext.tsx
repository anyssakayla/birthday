import React, { createContext, useContext, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Theme, ThemeMode, lightTheme, darkTheme } from '@/theme/types';

interface ThemeContextValue {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  isDarkMode,
  onThemeChange,
}) => {
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const toggleTheme = () => {
    onThemeChange(!isDarkMode);
  };
  
  const setThemeMode = (mode: ThemeMode) => {
    onThemeChange(mode === 'dark');
  };

  const contextValue: ThemeContextValue = {
    theme,
    isDarkMode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};