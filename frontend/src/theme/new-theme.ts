import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// Define the color scheme type
type ColorScheme = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  text: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  notification: string;
  success: string;
  warning: string;
  info: string;
  card: string;
  border: string;
};

// Light color scheme
const lightColors: ColorScheme = {
  primary: '#3498db',
  secondary: '#f1c40f',
  background: '#ffffff',
  surface: '#ffffff',
  error: '#e74c3c',
  text: '#2c3e50',
  disabled: '#95a5a6',
  placeholder: '#95a5a6',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#e74c3c',
  success: '#2ecc71',
  warning: '#f39c12',
  info: '#3498db',
  card: '#ffffff',
  border: '#dfe6e9',
};

// Dark color scheme
const darkColors: ColorScheme = {
  primary: '#3498db',
  secondary: '#f1c40f',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#e74c3c',
  text: '#ecf0f1',
  disabled: '#7f8c8d',
  placeholder: '#7f8c8d',
  backdrop: 'rgba(0, 0, 0, 0.7)',
  notification: '#e74c3c',
  success: '#2ecc71',
  warning: '#f39c12',
  info: '#3498db',
  card: '#1e1e1e',
  border: '#2d3436',
};

// Font configuration
const fontConfig = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

// Create theme variants
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

// Default export for backward compatibility
export const theme = lightTheme;

export type AppTheme = typeof lightTheme;
