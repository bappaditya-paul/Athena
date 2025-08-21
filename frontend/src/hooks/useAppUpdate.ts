import {useState, useEffect, useCallback} from 'react';
import {Platform, Alert, Linking, AppState} from 'react-native';
import VersionCheck from 'react-native-version-check';

type UpdateType = 'force' | 'optional' | 'none';

type UpdateInfo = {
  updateType: UpdateType;
  currentVersion: string;
  latestVersion: string;
  isNeeded: boolean;
  storeUrl: string;
};

const useAppUpdate = (options?: {forceUpdateEnabled?: boolean}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const {forceUpdateEnabled = true} = options || {};

  // Check for app updates
  const checkForUpdate = useCallback(async () => {
    try {
      setIsChecking(true);
      
      const currentVersion = await VersionCheck.getCurrentVersion();
      const latestVersion = await VersionCheck.getLatestVersion();
      const storeUrl = await VersionCheck.getStoreUrl();
      
      const needsUpdate = await VersionCheck.needUpdate();
      const updateType: UpdateType = forceUpdateEnabled && needsUpdate?.isNeeded ? 'force' : 'optional';

      const info: UpdateInfo = {
        updateType: needsUpdate?.isNeeded ? updateType : 'none',
        currentVersion,
        latestVersion,
        isNeeded: needsUpdate?.isNeeded || false,
        storeUrl,
      };

      setUpdateInfo(info);
      return info;
    } catch (err) {
      console.error('Error checking for updates:', err);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [forceUpdateEnabled]);

  // Open app store for update
  const openStore = useCallback(async () => {
    try {
      const url = updateInfo?.storeUrl || (await VersionCheck.getStoreUrl());
      if (url) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error opening store:', err);
      return false;
    }
  }, [updateInfo]);

  // Show update alert
  const showUpdateAlert = useCallback(() => {
    if (!updateInfo?.isNeeded) return;

    const buttons = [
      {text: 'Update Now', onPress: openStore},
    ];

    if (updateInfo.updateType === 'optional') {
      buttons.push({text: 'Later', style: 'cancel'});
    }

    Alert.alert(
      'Update Available',
      `Version ${updateInfo.latestVersion} is available. Please update to the latest version.`,
      buttons,
      {cancelable: updateInfo.updateType !== 'force'}
    );
  }, [openStore, updateInfo]);

  // Check for updates on mount
  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  return {
    updateInfo,
    isChecking,
    checkForUpdate,
    openStore,
    showUpdateAlert,
  };
};

export default useAppUpdate;
