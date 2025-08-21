import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import analytics from '@react-native-firebase/analytics';

type EventParams = {
  [key: string]: any;
};

type ScreenViewParams = {
  screen_name: string;
  screen_class: string;
  [key: string]: any;
};

const useAnalytics = () => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const currentScreen = useRef<string | null>(null);

  // Track app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        logEvent('app_foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        logEvent('app_background');
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Set user properties
  const setUserProperties = async (properties: Record<string, any>) => {
    try {
      await Promise.all(
        Object.entries(properties).map(([key, value]) =>
          analytics().setUserProperty(key, String(value))
        )
      );
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  };

  // Set user ID
  const setUserId = async (userId: string | null) => {
    try {
      if (userId) {
        await analytics().setUserId(userId);
      } else {
        await analytics().setUserId(null);
      }
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  };

  // Log an event
  const logEvent = async (eventName: string, params?: EventParams) => {
    try {
      await analytics().logEvent(eventName, params);
      console.log(`[Analytics] Event logged: ${eventName}`, params);
    } catch (error) {
      console.error(`Error logging event ${eventName}:`, error);
    }
  };

  // Log screen view
  const logScreenView = async (params: ScreenViewParams) => {
    try {
      // Don't log the same screen multiple times
      if (currentScreen.current === params.screen_name) return;
      
      currentScreen.current = params.screen_name;
      await analytics().logScreenView({
        screen_name: params.screen_name,
        screen_class: params.screen_class,
      });
      
      // Also log as an event for more detailed tracking
      await logEvent('screen_view', params);
    } catch (error) {
      console.error('Error logging screen view:', error);
    }
  };

  // Log a search
  const logSearch = async (searchTerm: string, params?: EventParams) => {
    try {
      await analytics().logSearch({
        search_term: searchTerm,
        ...params,
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  };

  // Log a sign up
  const logSignUp = async (method: string, params?: EventParams) => {
    try {
      await analytics().logSignUp({
        method,
        ...params,
      });
    } catch (error) {
      console.error('Error logging sign up:', error);
    }
  };

  // Log a login
  const logLogin = async (method: string, params?: EventParams) => {
    try {
      await analytics().logLogin({
        method,
        ...params,
      });
    } catch (error) {
      console.error('Error logging login:', error);
    }
  };

  // Log a tutorial begin
  const logTutorialBegin = async (params?: EventParams) => {
    try {
      await analytics().logTutorialBegin(params);
    } catch (error) {
      console.error('Error logging tutorial begin:', error);
    }
  };

  // Log a tutorial complete
  const logTutorialComplete = async (params?: EventParams) => {
    try {
      await analytics().logTutorialComplete(params);
    } catch (error) {
      console.error('Error logging tutorial complete:', error);
    }
  };

  // Reset analytics data for the current app instance
  const resetAnalyticsData = async () => {
    try {
      await analytics().resetAnalyticsData();
    } catch (error) {
      console.error('Error resetting analytics data:', error);
    }
  };

  return {
    logEvent,
    logScreenView,
    logSearch,
    logSignUp,
    logLogin,
    logTutorialBegin,
    logTutorialComplete,
    setUserProperties,
    setUserId,
    resetAnalyticsData,
  };
};

export default useAnalytics;
