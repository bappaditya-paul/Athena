/// <reference types="react" />
/// <reference types="react-native" />
/// <reference types="react-native-paper" />

// Declare missing modules
declare module 'react-native-keychain' {
  export interface UserCredentials {
    username: string;
    password: string;
    service?: string;
    storage?: string;
  }

  export interface Options {
    accessControl?: string;
    accessible?: string;
    service?: string;
    securityLevel?: string;
    storage?: string;
    authenticationPrompt?: string | {
      title?: string;
      subtitle?: string;
      description?: string;
      cancel?: string;
    };
  }

  export function setGenericPassword(
    username: string,
    password: string,
    options?: Options
  ): Promise<boolean>;

  export function getGenericPassword(
    options?: Options
  ): Promise<false | UserCredentials>;

  export function resetGenericPassword(options?: Options): Promise<boolean>;
}

declare module 'expo-local-authentication' {
  export enum AuthenticationType {
    FINGERPRINT = 1,
    FACIAL_RECOGNITION = 2,
    IRIS = 3,
  }

  export async function hasHardwareAsync(): Promise<boolean>;
  export async function isEnrolledAsync(): Promise<boolean>;
  export async function getEnrolledLevelAsync(): Promise<number>;
  export async function supportedAuthenticationTypesAsync(): Promise<AuthenticationType[]>;
  export async function authenticateAsync(options?: {
    promptMessage?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
    cancelLabel?: string;
    requireConfirmation?: boolean;
  }): Promise<{ success: boolean; error?: string }>;
}

// Add global type declarations
declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}
