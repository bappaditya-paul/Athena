import {useState, useEffect} from 'react';
import {NetInfo} from 'react-native';

const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial network status check
    const checkNetworkStatus = async () => {
      try {
        const state = await NetInfo.fetch();
        updateState(state);
      } catch (error) {
        console.error('Error checking network status:', error);
      }
    };

    // Subscribe to network status updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      updateState(state);
    });

    // Check initial status
    checkNetworkStatus();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const updateState = (state: any) => {
    setIsConnected(state.isConnected);
    setConnectionType(state.type);
    setIsInternetReachable(state.isInternetReachable);
  };

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    isOffline: isConnected === false || isInternetReachable === false,
  };
};

export default useNetworkStatus;
