import {useState, useCallback, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../types/navigation';
import * as api from '../services/api';

type User = {
  id: string;
  email: string;
  name: string;
  token: string;
  refreshToken: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AUTH_STORAGE_KEY = '@Athena:auth';

const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          api.setAuthTokens({
            access: parsedUser.token,
            refresh: parsedUser.refreshToken,
          });
        }
      } catch (err) {
        console.error('Failed to load user data', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to storage when it changes
  useEffect(() => {
    const saveUser = async () => {
      if (user) {
        try {
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } catch (err) {
          console.error('Failed to save user data', err);
        }
      } else {
        try {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (err) {
          console.error('Failed to remove user data', err);
        }
      }
    };

    saveUser();
  }, [user]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.login(email, password);
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          token: response.token,
          refreshToken: response.refreshToken,
        };

        setUser(userData);
        api.setAuthTokens({
          access: response.token,
          refresh: response.refreshToken,
        });

        // Navigate to home after successful login
        navigation.replace('Home');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigation]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.register(email, password, name);
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          token: response.token,
          refreshToken: response.refreshToken,
        };

        setUser(userData);
        api.setAuthTokens({
          access: response.token,
          refresh: response.refreshToken,
        });

        // Navigate to home after successful registration
        navigation.replace('Home');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigation]
  );

  const logout = useCallback(async () => {
    try {
      // Call your API to invalidate the token if needed
      // await api.logout();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      // Clear user data regardless of API call result
      setUser(null);
      api.setAuthTokens(null);
      navigation.replace('Auth');
    }
  }, [navigation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};

export default useAuth;
