import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Theme as NavigationTheme } from '@react-navigation/native';
import { lightTheme, darkTheme, AppTheme } from '../theme';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: AppTheme & { dark: boolean } & NavigationTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const theme = useMemo(() => ({
    ...(isDark ? darkTheme : lightTheme),
    dark: isDark,
  }), [isDark]);

  const toggleTheme = () => {
    setThemeMode(prevMode => {
      if (prevMode === 'system') return 'dark';
      if (prevMode === 'dark') return 'light';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        toggleTheme,
        isDark,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
