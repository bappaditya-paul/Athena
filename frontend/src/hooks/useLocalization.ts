import {useState, useEffect, useCallback} from 'react';
import {I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const LOCALE_STORAGE_KEY = '@Athena:locale';

// Supported languages
const SUPPORTED_LOCALES = {
  en: {name: 'English', isRTL: false},
  es: {name: 'Español', isRTL: false},
  fr: {name: 'Français', isRTL: false},
};

type LocaleCode = keyof typeof SUPPORTED_LOCALES;
type Translations = Record<string, string>;

// Default translations (English)
const TRANSLATIONS: Record<LocaleCode, Translations> = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
  },
  es: {
    welcome: 'Bienvenido',
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
  },
  fr: {
    welcome: 'Bienvenue',
    login: 'Connexion',
    signup: 'S\'inscrire',
    email: 'E-mail',
    password: 'Mot de passe',
  },
};

const useLocalization = () => {
  const [locale, setLocale] = useState<LocaleCode>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved locale or use device locale
  useEffect(() => {
    const loadLocale = async () => {
      try {
        // Try to get saved locale
        const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode;
        
        if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
          setLocale(savedLocale);
          setIsRTL(!!SUPPORTED_LOCALES[savedLocale].isRTL);
        } else {
          // Use device locale if supported, otherwise default to English
          const deviceLocale = Localization.locale.split('-')[0] as LocaleCode;
          const newLocale = SUPPORTED_LOCALES[deviceLocale] ? deviceLocale : 'en';
          setLocale(newLocale);
          setIsRTL(!!SUPPORTED_LOCALES[newLocale]?.isRTL);
        }
      } catch (error) {
        console.error('Error loading locale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocale();
  }, []);

  // Update RTL when locale changes
  useEffect(() => {
    if (isRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRTL);
      // Note: May need to restart the app for RTL changes to take full effect
    }
  }, [isRTL]);

  // Change locale
  const setLocaleWithSave = useCallback(async (newLocale: LocaleCode) => {
    if (!SUPPORTED_LOCALES[newLocale]) return;
    
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      setLocale(newLocale);
      setIsRTL(!!SUPPORTED_LOCALES[newLocale].isRTL);
    } catch (error) {
      console.error('Error saving locale:', error);
    }
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation = TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
      
      // Replace params in translation
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{{${param}}}`, String(value));
        });
      }
      
      return translation;
    },
    [locale]
  );

  return {
    locale,
    setLocale: setLocaleWithSave,
    isRTL,
    isLoading,
    t,
    supportedLocales: Object.entries(SUPPORTED_LOCALES).map(([code, data]) => ({
      code,
      name: data.name,
      isRTL: data.isRTL,
    })),
  };
};

export default useLocalization;
