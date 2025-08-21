import {useState, useCallback, useEffect} from 'react';
import {Platform, Alert, Linking} from 'react-native';
import InAppReview from 'react-native-in-app-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RATING_STORAGE_KEY = '@Athena:app_rating';
const MIN_APP_LAUNCHES = 3;
const MIN_DAYS_SINCE_INSTALL = 2;

type RatingStatus = {
  lastAsked: number | null;
  launchCount: number;
  hasRated: boolean;
  hasDeclined: boolean;
};

const useAppRating = () => {
  const [status, setStatus] = useState<RatingStatus>({
    lastAsked: null,
    launchCount: 0,
    hasRated: false,
    hasDeclined: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  // Load rating status from storage
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
        if (stored) {
          setStatus(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error loading rating status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
    setIsAvailable(InAppReview.isAvailable());
  }, []);

  // Save rating status to storage
  const saveStatus = useCallback(async (newStatus: RatingStatus) => {
    try {
      await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(newStatus));
      setStatus(newStatus);
    } catch (err) {
      console.error('Error saving rating status:', err);
    }
  }, []);

  // Track app launch
  const trackLaunch = useCallback(async () => {
    const newStatus = {
      ...status,
      launchCount: status.launchCount + 1,
    };
    await saveStatus(newStatus);
  }, [status, saveStatus]);

  // Check if we should ask for rating
  const shouldAskForRating = useCallback((): boolean => {
    if (status.hasRated || status.hasDeclined) return false;
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const daysSinceInstall = 7; // This would come from app install date
    const daysSinceLastAsked = status.lastAsked 
      ? (now - status.lastAsked) / oneDay 
      : Infinity;

    return (
      status.launchCount >= MIN_APP_LAUNCHES &&
      daysSinceInstall >= MIN_DAYS_SINCE_INSTALL &&
      daysSinceLastAsked >= 7 // Ask at most once per week
    );
  }, [status]);

  // Show rating dialog
  const requestReview = useCallback(async () => {
    if (!isAvailable) {
      return false;
    }

    try {
      const hasAction = await InAppReview.hasAction();
      if (!hasAction) return false;

      await InAppReview.RequestInAppReview();
      await saveStatus({...status, hasRated: true, lastAsked: Date.now()});
      return true;
    } catch (err) {
      console.error('Error requesting review:', err);
      return false;
    }
  }, [isAvailable, status, saveStatus]);

  // Show custom rating dialog if in-app review is not available
  const showCustomRatingDialog = useCallback((): boolean => {
    Alert.alert(
      'Enjoying Athena?',
      'Would you like to rate our app? It helps us improve!',
      [
        {
          text: 'No Thanks',
          style: 'cancel',
          onPress: () => saveStatus({...status, hasDeclined: true, lastAsked: Date.now()}),
        },
        {
          text: 'Rate Now',
          onPress: () => {
            saveStatus({...status, hasRated: true, lastAsked: Date.now()});
            const storeUrl = Platform.select({
              ios: 'https://apps.apple.com/app/idYOUR_APP_ID',
              android: 'market://details?id=com.yourapp.package',
            });
            if (storeUrl) {
              Linking.openURL(storeUrl).catch(console.error);
            }
          },
        },
      ],
      {cancelable: true}
    );
    return true;
  }, [status, saveStatus]);

  // Show feedback dialog (for users who don't want to rate)
  const showFeedbackDialog = useCallback((): boolean => {
    Alert.alert(
      'Help Us Improve',
      'Would you like to provide feedback instead?',
      [
        {
          text: 'No Thanks',
          style: 'cancel',
          onPress: () => saveStatus({...status, hasDeclined: true, lastAsked: Date.now()}),
        },
        {
          text: 'Send Feedback',
          onPress: () => {
            // Navigate to feedback screen or open email client
            const email = 'support@athena.com';
            const subject = 'Athena App Feedback';
            const body = 'I would like to share some feedback about the app...';
            const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            Linking.openURL(mailto).catch(console.error);
          },
        },
      ],
      {cancelable: true}
    );
    return true;
  }, [status, saveStatus]);

  // Check and prompt for rating if conditions are met
  const maybeAskForRating = useCallback(async () => {
    if (shouldAskForRating()) {
      const success = await requestReview();
      if (!success) {
        showCustomRatingDialog();
      }
    }
  }, [shouldAskForRating, requestReview, showCustomRatingDialog]);

  return {
    isAvailable,
    isLoading,
    status,
    trackLaunch,
    requestReview,
    showCustomRatingDialog,
    showFeedbackDialog,
    maybeAskForRating,
  };
};

export default useAppRating;
