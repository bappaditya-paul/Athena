import {useState, useEffect, useCallback} from 'react';
import {useColorScheme, ColorSchemeName} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Theme, darkTheme} from '../theme';

const THEME_PREFERENCE_KEY = '@Athena:themePreference';

type ThemePreference = 'light' | 'dark' | 'system';

const useThemePreference = () => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
          setThemePreference(savedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference to storage
  const saveThemePreference = useCallback(async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
      setThemePreference(preference);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  }, []);

  // Determine the actual theme to use based on preference and system settings
  const getTheme = useCallback((): Theme['colors'] => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? darkTheme.colors : theme.colors;
    }
    return themePreference === 'dark' ? darkTheme.colors : theme.colors;
  }, [themePreference, systemColorScheme]);

  return {
    theme: getTheme(),
    themePreference,
    setThemePreference: saveThemePreference,
    isLoading,
    isDark: getTheme() === darkTheme.colors,
  };
};

export default useThemePreference;
