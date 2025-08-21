import {useState, useEffect, useCallback} from 'react';
import {Platform, Alert} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';

type KeychainOptions = Keychain.Options & {
  accessControl?: string;
  accessible?: string;
  securityLevel?: string;
  storage?: string;
};

type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

const BIOMETRIC_KEY = 'athena_biometric_auth';

type BiometricResult = {
  success: boolean;
  error?: string;
};

const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if biometric authentication is available
  const checkBiometricSupport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      
      if (!isSupported) {
        setIsAvailable(false);
        setBiometricType('none');
        return false;
      }
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsEnrolled(enrolled);
      
      if (!enrolled) {
        setIsAvailable(false);
        setBiometricType('none');
        return false;
      }
      
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris');
      } else {
        setBiometricType('none');
        return false;
      }
      
      setIsAvailable(true);
      return true;
    } catch (err) {
      console.error('Error checking biometric support:', err);
      setError('Failed to check biometric support');
      setIsAvailable(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Authenticate with biometrics
  const authenticate = useCallback(async (reason = 'Authenticate to continue'): Promise<BiometricResult> => {
    try {
      if (!isAvailable || !isEnrolled) {
        const isSupported = await checkBiometricSupport();
        if (!isSupported) {
          return {
            success: false,
            error: 'Biometric authentication is not available',
          };
        }
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return {
        success: result.success,
        error: result.success ? undefined : result.error || 'Authentication failed',
      };
    } catch (err) {
      console.error('Biometric authentication error:', err);
      return {
        success: false,
        error: 'An error occurred during authentication',
      };
    }
  }, [isAvailable, isEnrolled, checkBiometricSupport]);

  // Save credentials to keychain with biometric protection
  const saveCredentials = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      if (!isAvailable) {
        const isSupported = await checkBiometricSupport();
        if (!isSupported) {
          return false;
        }
      }

      // For Android, we need to authenticate first
      if (Platform.OS === 'android') {
        const authResult = await authenticate('Authenticate to save credentials');
        if (!authResult.success) {
          return false;
        }
      }

      // Using type assertion for Keychain options to handle different versions
      const options: KeychainOptions = {
        accessible: 'AccessibleWhenPasscodeSetThisDeviceOnly' as any,
        accessControl: Platform.select({
          ios: 'BiometryAnyOrDevicePasscode' as any,
          android: 'BiometryAny' as any,
        }),
        securityLevel: 'SECURE_SOFTWARE' as any,
        storage: 'RSA' as any,
      };

      await Keychain.setGenericPassword(username, password, {
        service: BIOMETRIC_KEY,
        ...options,
      });

      return true;
    } catch (err) {
      console.error('Error saving credentials:', err);
      return false;
    }
  }, [authenticate, checkBiometricSupport, isAvailable]);

  // Get credentials with biometric authentication
  const getCredentials = useCallback(async (): Promise<{username: string; password: string} | null> => {
    try {
      if (!isAvailable) {
        const isSupported = await checkBiometricSupport();
        if (!isSupported) {
          return null;
        }
      }

      // For Android, we need to authenticate first
      if (Platform.OS === 'android') {
        const authResult = await authenticate('Authenticate to retrieve credentials');
        if (!authResult.success) {
          return null;
        }
      }

      // Using type assertion for authentication prompt
      const options: Keychain.Options = {
        authenticationPrompt: {
          title: 'Authenticate to continue',
          subtitle: 'Use your biometric to access your account',
          description: '',
          cancel: 'Cancel',
        } as any,
      };

      const credentials = await Keychain.getGenericPassword({
        service: BIOMETRIC_KEY,
        ...options,
      });

      if (credentials && typeof credentials === 'object' && 'username' in credentials && 'password' in credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      
      return null;
    } catch (err) {
      console.error('Error getting credentials:', err);
      return null;
    }
  }, [authenticate, checkBiometricSupport, isAvailable]);

  // Remove saved credentials
  const removeCredentials = useCallback(async (): Promise<boolean> => {
    try {
      await Keychain.resetGenericPassword({service: BIOMETRIC_KEY});
      return true;
    } catch (err) {
      console.error('Error removing credentials:', err);
      return false;
    }
  }, []);

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricSupport();
  }, [checkBiometricSupport]);

  return {
    isAvailable,
    isEnrolled,
    isLoading,
    error,
    biometricType,
    authenticate,
    saveCredentials,
    getCredentials,
    removeCredentials,
  };
};

export default useBiometrics;
