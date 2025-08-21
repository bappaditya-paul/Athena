import {DefaultTheme, configureFonts} from 'react-native-paper';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
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
  },
  fonts: configureFonts(fontConfig),
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#e74c3c',
    text: '#ecf0f1',
    disabled: '#7f8c8d',
    placeholder: '#7f8c8d',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    card: '#1e1e1e',
    border: '#2d3436',
  },
};
