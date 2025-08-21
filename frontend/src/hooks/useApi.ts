import {useState, useCallback, useRef, useEffect} from 'react';

type ApiFunction<T, P extends any[]> = (...args: P) => Promise<T>;

type UseApiReturn<T, P extends any[]> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T | null>;
  clearError: () => void;
  setData: (data: T | null) => void;
};

const useApi = <T, P extends any[] = []>(
  apiFunction: ApiFunction<T, P>,
  initialData: T | null = null,
  immediate: boolean = false
): UseApiReturn<T, P> => {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef<boolean>(true);

  // Set isMounted to false when the component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Execute the API call
  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      if (!isMounted.current) return null;
      
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        if (isMounted.current) {
          setData(result);
          setLoading(false);
        }
        return result;
      } catch (err) {
        if (isMounted.current) {
          const error = err instanceof Error ? err : new Error('An unknown error occurred');
          setError(error);
          setLoading(false);
          console.error('API call failed:', error);
        }
        return null;
      }
    },
    [apiFunction]
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Call the API immediately if requested
  useEffect(() => {
    if (immediate) {
      // @ts-ignore - TypeScript has issues with the spread operator here
      execute(...[]);
    }
    // We only want to run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    clearError,
    setData,
  };
};

export default useApi;
