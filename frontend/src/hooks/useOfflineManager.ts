import {useState, useEffect, useCallback, useRef} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppState} from './useAppState';

const QUEUE_STORAGE_KEY = '@Athena:offlineQueue';

type QueuedAction<T = any> = {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  retryCount: number;
  maxRetries?: number;
};

type ProcessActionFunction<T = any> = (action: QueuedAction<T>) => Promise<boolean>;

type UseOfflineManagerReturn = {
  isOnline: boolean;
  isSynchronizing: boolean;
  queueAction: <T>(action: Omit<QueuedAction<T>, 'id' | 'timestamp' | 'retryCount'>) => Promise<string>;
  retryAll: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueue: () => Promise<QueuedAction[]>;
};

const useOfflineManager = (processAction: ProcessActionFunction): UseOfflineManagerReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSynchronizing, setIsSynchronizing] = useState<boolean>(false);
  const queueRef = useRef<QueuedAction[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const {isActive} = useAppState();

  // Load queued actions from storage on mount
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const savedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (savedQueue) {
          queueRef.current = JSON.parse(savedQueue);
        }
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    };

    loadQueue();
  }, []);

  // Save queue to storage whenever it changes
  const saveQueue = useCallback(async (queue: QueuedAction[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }, []);

  // Process the queue when online and app is active
  useEffect(() => {
    if (isOnline && isActive && !isSynchronizing) {
      processQueue();
    }
  }, [isOnline, isActive, isSynchronizing]);

  // Set up network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = isOnline;
      const nowOnline = state.isConnected && state.isInternetReachable !== false;
      
      setIsOnline(nowOnline);
      
      // If we just came back online, process the queue
      if (!wasOnline && nowOnline && isActive) {
        processQueue();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isActive, isOnline]);

  // Add an action to the queue
  const queueAction = useCallback(async <T,>(
    action: Omit<QueuedAction<T>, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<string> => {
    const newAction: QueuedAction<T> = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    const newQueue = [...queueRef.current, newAction];
    queueRef.current = newQueue;
    await saveQueue(newQueue);

    // If online, try to process the queue
    if (isOnline) {
      processQueue();
    }

    return newAction.id;
  }, [isOnline, saveQueue]);

  // Process all actions in the queue
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || !isOnline || !isActive) return;
    
    isProcessingRef.current = true;
    setIsSynchronizing(true);

    try {
      const queue = [...queueRef.current];
      
      for (let i = 0; i < queue.length; i++) {
        const action = queue[i];
        
        try {
          const success = await processAction(action);
          
          if (success) {
            // Remove successful action from queue
            queue.splice(i, 1);
            i--; // Adjust index after removal
          } else {
            // Increment retry count for failed action
            action.retryCount += 1;
            
            // Remove action if max retries reached
            if (action.maxRetries !== undefined && action.retryCount >= action.maxRetries) {
              queue.splice(i, 1);
              i--; // Adjust index after removal
            }
          }
        } catch (error) {
          console.error(`Error processing action ${action.id}:`, error);
          action.retryCount += 1;
          
          // Remove action if max retries reached
          if (action.maxRetries !== undefined && action.retryCount >= action.maxRetries) {
            queue.splice(i, 1);
            i--; // Adjust index after removal
          }
        }
        
        // Update the queue in state and storage
        queueRef.current = [...queue];
        await saveQueue(queue);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      isProcessingRef.current = false;
      setIsSynchronizing(false);
    }
  }, [isOnline, isActive, processAction, saveQueue]);

  // Retry all actions in the queue
  const retryAll = useCallback(async () => {
    if (isOnline && !isSynchronizing) {
      await processQueue();
    }
  }, [isOnline, isSynchronizing, processQueue]);

  // Clear all actions from the queue
  const clearQueue = useCallback(async () => {
    queueRef.current = [];
    await saveQueue([]);
  }, [saveQueue]);

  // Get the current queue
  const getQueue = useCallback(async (): Promise<QueuedAction[]> => {
    return [...queueRef.current];
  }, []);

  return {
    isOnline,
    isSynchronizing,
    queueAction,
    retryAll,
    clearQueue,
    getQueue,
  };
};

export default useOfflineManager;
