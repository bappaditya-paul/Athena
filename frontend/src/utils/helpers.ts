import {Alert, Linking, Platform} from 'react-native';
import {Theme} from '../theme';

// Format date to a readable string
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Open a URL in the device's default browser
export const openURL = async (url: string): Promise<void> => {
  const supported = await Linking.canOpenURL(url);
  
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert(`Don't know how to open this URL: ${url}`);
  }
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
export const validatePassword = (password: string): {valid: boolean; message: string} => {
  if (password.length < 8) {
    return {valid: false, message: 'Password must be at least 8 characters long'};
  }
  if (!/[A-Z]/.test(password)) {
    return {valid: false, message: 'Password must contain at least one uppercase letter'};
  }
  if (!/[a-z]/.test(password)) {
    return {valid: false, message: 'Password must contain at least one lowercase letter'};
  }
  if (!/[0-9]/.test(password)) {
    return {valid: false, message: 'Password must contain at least one number'};
  }
  return {valid: true, message: 'Password is strong'};
};

// Check if device is iOS
export const isIOS = (): boolean => Platform.OS === 'ios';

// Check if device is Android
export const isAndroid = (): boolean => Platform.OS === 'android';

// Debounce function to limit the rate at which a function can fire
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get contrast color for text based on background color
export const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get a random element from an array
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
