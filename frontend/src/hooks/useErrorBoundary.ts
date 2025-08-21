import {useState, useCallback, useRef, useEffect} from 'react';
import {ErrorUtils} from 'react-native';

declare global {
  interface PromiseRejectionEvent extends Event {
    reason: any;
    promise: Promise<any>;
  }
  
  interface Window {
    onunhandledrejection?: (event: PromiseRejectionEvent) => void;
  }
}

type ErrorHandler = (error: Error, stackTrace: string) => void;
type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
};

const useErrorBoundary = (onError?: ErrorHandler) => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const errorHandler = useRef<ErrorHandler | null>(null);

  // Set up global error handler
  useEffect(() => {
    const defaultErrorHandler = (error: Error) => {
      console.error('Unhandled error:', error);
    };

    const errorHandlerWrapper = (error: Error, isFatal?: boolean) => {
      if (errorHandler.current) {
        errorHandler.current(error, error.stack || '');
      } else {
        defaultErrorHandler(error);
      }
    };

    // Set up global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(errorHandlerWrapper);

    // Set up unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorHandlerWrapper(event.reason, false);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Set up custom error handler if provided
    if (onError) {
      errorHandler.current = onError;
    }

    // Cleanup
    return () => {
      ErrorUtils.setGlobalHandler(originalHandler);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  // Method to handle errors in components
  const handleError = useCallback(
    (error: Error, errorInfo: any) => {
      console.error('Error boundary caught an error:', error, errorInfo);
      
      setErrorState({
        hasError: true,
        error,
        errorInfo,
      });

      // Call the custom error handler if provided
      if (errorHandler.current) {
        errorHandler.current(error, errorInfo?.componentStack || '');
      }
    },
    []
  );

  // Reset the error state
  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }, []);

  // Get the error boundary props
  const getErrorBoundaryProps = useCallback(() => ({
    onError: handleError,
  }), [handleError]);

  return {
    ...errorState,
    handleError,
    resetError,
    getErrorBoundaryProps,
  };
};

export default useErrorBoundary;
