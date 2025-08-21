import {useState, useCallback} from 'react';
import {Image, Platform, Alert} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {check, PERMISSIONS, request} from 'react-native-permissions';

type ImageType = {
  uri: string;
  type?: string;
  name?: string;
  width?: number;
  height?: number;
  fileSize?: number;
};

const useImagePicker = () => {
  const [image, setImage] = useState<ImageType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      });

      if (!permission) return false;

      const status = await check(permission);
      
      if (status === 'granted') return true;
      if (status === 'blocked') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in the app settings.',
        );
        return false;
      }

      const requestStatus = await request(permission);
      return requestStatus === 'granted';
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      return false;
    }
  }, []);

  // Request photo library permission
  const requestMediaPermission = useCallback(async () => {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      });

      if (!permission) return false;

      const status = await check(permission);
      
      if (status === 'granted') return true;
      if (status === 'blocked') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images. Please enable it in the app settings.',
        );
        return false;
      }

      const requestStatus = await request(permission);
      return requestStatus === 'granted';
    } catch (err) {
      console.error('Error requesting media permission:', err);
      return false;
    }
  }, []);

  // Get image dimensions
  const getImageDimensions = useCallback((uri: string): Promise<{width: number; height: number}> => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({width, height}),
        (err) => reject(err)
      );
    });
  }, []);

  // Process selected image
  const processImage = useCallback(async (response: ImagePicker.ImagePickerResponse) => {
    try {
      if (response.didCancel) {
        return null;
      }

      if (response.errorMessage) {
        throw new Error(response.errorMessage);
      }

      if (!response.assets || response.assets.length === 0) {
        throw new Error('No image selected');
      }

      const asset = response.assets[0];
      if (!asset.uri) {
        throw new Error('Invalid image URI');
      }

      const dimensions = await getImageDimensions(asset.uri);
      
      const imageInfo: ImageType = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        width: dimensions.width,
        height: dimensions.height,
        fileSize: asset.fileSize,
      };

      return imageInfo;
    } catch (err) {
      console.error('Error processing image:', err);
      throw err;
    }
  }, [getImageDimensions]);

  // Take a photo
  const takePhoto = useCallback(async (options: ImagePicker.CameraOptions = {}) => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return null;

      setIsLoading(true);
      setError(null);

      const response = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        ...options,
      });

      const processedImage = await processImage(response);
      if (processedImage) {
        setImage(processedImage);
      }
      
      return processedImage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to take photo';
      setError(errorMessage);
      console.error('Error taking photo:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [processImage, requestCameraPermission]);

  // Pick an image from library
  const pickImage = useCallback(async (options: ImagePicker.ImageLibraryOptions = {}) => {
    try {
      const hasPermission = await requestMediaPermission();
      if (!hasPermission) return null;

      setIsLoading(true);
      setError(null);

      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
        ...options,
      });

      const processedImage = await processImage(response);
      if (processedImage) {
        setImage(processedImage);
      }
      
      return processedImage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pick image';
      setError(errorMessage);
      console.error('Error picking image:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [processImage, requestMediaPermission]);

  // Clear selected image
  const clearImage = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  return {
    image,
    isLoading,
    error,
    takePhoto,
    pickImage,
    clearImage,
  };
};

export default useImagePicker;
