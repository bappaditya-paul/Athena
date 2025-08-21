import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import {DefaultTheme, DarkTheme as PaperDarkTheme} from 'react-native-paper';
import {theme, darkTheme} from '../theme';

type ThemeType = 'light' | 'dark';

type ThemeContextType = {
  theme: typeof theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (themeType: ThemeType) => {
    setIsDark(themeType === 'dark');
  };

  const currentTheme = isDark
    ? {
        ...theme,
        ...PaperDarkTheme,
        colors: {
          ...theme.colors,
          ...darkTheme.colors,
        },
      }
    : theme;

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDark,
        toggleTheme,
        setTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
