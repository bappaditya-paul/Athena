import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';

type Callback = (appState: AppStateStatus) => void;

type UseAppStateReturn = {
  appState: AppStateStatus;
  isActive: boolean;
  isInactive: boolean;
  isBackground: boolean;
};

const useAppState = (onChange?: Callback): UseAppStateReturn => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [currentAppState, setCurrentAppState] = useState<AppStateStatus>(appState.current);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current !== nextAppState) {
        appState.current = nextAppState;
        setCurrentAppState(nextAppState);
        
        if (onChange) {
          onChange(nextAppState);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);

  return {
    appState: currentAppState,
    isActive: currentAppState === 'active',
    isInactive: currentAppState === 'inactive',
    isBackground: currentAppState === 'background',
  };
};

export default useAppState;
