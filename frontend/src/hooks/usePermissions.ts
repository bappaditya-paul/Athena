import {useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Permission, PermissionStatus} from 'react-native';

type PermissionType = {
  android: Permission[];
  ios?: string[]; // For iOS, we'll use request from react-native-permissions in a real app
};

type PermissionStatuses = {
  [key: string]: PermissionStatus | string;
};

const usePermissions = (permissions: PermissionType) => {
  const [permissionStatuses, setPermissionStatuses] = useState<PermissionStatuses>({});
  const [allGranted, setAllGranted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') {
      console.warn('This hook currently only supports Android permissions');
      return false;
    }

    try {
      setIsLoading(true);
      const results: PermissionStatuses = {};
      let allGranted = true;

      // Request each permission
      for (const permission of permissions.android) {
        try {
          const status = await PermissionsAndroid.request(permission);
          results[permission] = status;
          
          if (status !== PermissionsAndroid.RESULTS.GRANTED) {
            allGranted = false;
          }
        } catch (error) {
          console.error(`Error requesting ${permission}:`, error);
          results[permission] = 'unavailable';
          allGranted = false;
        }
      }

      setPermissionStatuses(results);
      setAllGranted(allGranted);
      return allGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check current permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        const results: PermissionStatuses = {};
        let allGranted = true;

        for (const permission of permissions.android) {
          try {
            const status = await PermissionsAndroid.check(permission);
            results[permission] = status 
              ? PermissionsAndroid.RESULTS.GRANTED 
              : PermissionsAndroid.RESULTS.DENIED;
            
            if (!status) {
              allGranted = false;
            }
          } catch (error) {
            console.error(`Error checking ${permission}:`, error);
            results[permission] = 'unavailable';
            allGranted = false;
          }
        }

        setPermissionStatuses(results);
        setAllGranted(allGranted);
      }
      
      setIsLoading(false);
    };

    checkPermissions();
  }, [permissions.android]);

  const checkPermission = (permission: Permission): boolean => {
    return permissionStatuses[permission] === PermissionsAndroid.RESULTS.GRANTED;
  };

  return {
    permissionStatuses,
    allGranted,
    isLoading,
    requestPermissions,
    checkPermission,
  };
};

export default usePermissions;
