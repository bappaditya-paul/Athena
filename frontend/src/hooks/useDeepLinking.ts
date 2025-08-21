import {useEffect, useState, useCallback} from 'react';
import {Linking, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

type DeepLink = {
  url: string;
  path: string;
  params: Record<string, string>;
};

const useDeepLinking = () => {
  const [deepLink, setDeepLink] = useState<DeepLink | null>(null);
  const [initialUrl, setInitialUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Parse URL into path and params
  const parseUrl = useCallback((url: string): DeepLink => {
    try {
      // Remove any whitespace and trailing slashes
      const cleanUrl = url.trim().replace(/\/+$/, '');
      
      // Extract path and query params
      const [path, queryString] = cleanUrl.split('?');
      const params: Record<string, string> = {};
      
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
          }
        });
      }
      
      return {
        url: cleanUrl,
        path: path.replace(/^https?:\/\/[^/]+/, ''), // Remove domain
        params,
      };
    } catch (error) {
      console.error('Error parsing URL:', error);
      return {
        url,
        path: '',
        params: {},
      };
    }
  }, []);

  // Handle incoming deep links
  const handleDeepLink = useCallback((url: string | null) => {
    if (!url) return;
    
    try {
      const parsed = parseUrl(url);
      setDeepLink(parsed);
      return parsed;
    } catch (error) {
      console.error('Error handling deep link:', error);
      return null;
    }
  }, [parseUrl]);

  // Handle initial URL when app is closed
  const getInitialUrl = useCallback(async () => {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        setInitialUrl(url);
        return handleDeepLink(url);
      }
      return null;
    } catch (error) {
      console.error('Error getting initial URL:', error);
      return null;
    }
  }, [handleDeepLink]);

  // Set up deep linking listeners
  useEffect(() => {
    // Get initial URL when app is opened from a cold start
    getInitialUrl();

    // Listen for incoming deep links when app is in background/foreground
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url);
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [getInitialUrl, handleDeepLink]);

  // Process deep link to navigate to the appropriate screen
  const processDeepLink = useCallback(async (link: DeepLink) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const {path, params} = link;
      
      // Example deep link handling
      // You should customize this based on your app's navigation structure
      if (path.startsWith('/analyze')) {
        const {url} = params;
        if (url) {
          navigation.navigate('Analysis', {url});
        }
      } else if (path.startsWith('/article')) {
        const {id} = params;
        if (id) {
          navigation.navigate('Article', {id});
        }
      } else if (path.startsWith('/profile')) {
        navigation.navigate('Profile');
      }
      
      // Reset deep link after processing
      setDeepLink(null);
    } catch (error) {
      console.error('Error processing deep link:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, navigation]);

  // Process deep link when it changes
  useEffect(() => {
    if (deepLink) {
      processDeepLink(deepLink);
    }
  }, [deepLink, processDeepLink]);

  // Create a deep link URL
  const createDeepLink = useCallback((path: string, params: Record<string, string> = {}) => {
    const baseUrl = 'athena://app'; // Replace with your app's URL scheme
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
  }, []);

  // Open a URL in the device's browser
  const openUrl = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  }, []);

  return {
    deepLink,
    initialUrl,
    isProcessing,
    processDeepLink,
    createDeepLink,
    openUrl,
  };
};

export default useDeepLinking;
