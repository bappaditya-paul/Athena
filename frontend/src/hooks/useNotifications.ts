import {useState, useEffect, useCallback} from 'react';
import {Platform, AppState} from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

type Notification = {
  id: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
};

type ChannelConfig = {
  channelId: string;
  channelName: string;
  importance?: number;
};

const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [initialNotification, setInitialNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize notifications
  useEffect(() => {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel',
          channelName: 'Default Channel',
          importance: 4,
        },
        created => console.log(`Channel created: ${created}`)
      );
    }

    // Configure notification handlers
    PushNotification.configure({
      onNotification: handleNotification,
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
      permissions: {alert: true, badge: true, sound: true},
    });

    // Request permissions and get FCM token
    const init = async () => {
      await requestPermissions();
      await getFcmToken();
      
      // Get initial notification if app was opened from a notification
      const initialNotif = await messaging().getInitialNotification();
      if (initialNotif) {
        const notification = mapRemoteMessageToNotification(initialNotif);
        setInitialNotification(notification);
      }
    };

    init();

    // Set up message handlers
    const unsubscribeMessage = messaging().onMessage(handleForegroundMessage);
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(setFcmToken);

    return () => {
      unsubscribeMessage();
      unsubscribeTokenRefresh();
    };
  }, []);

  // Request notification permissions
  const requestPermissions = async () => {
    try {
      await messaging().requestPermission();
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  // Get FCM token
  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  // Map FCM message to notification object
  const mapRemoteMessageToNotification = (message: any): Notification => ({
    id: message.messageId || Date.now().toString(),
    title: message.notification?.title || 'New Notification',
    message: message.notification?.body || '',
    data: message.data,
    timestamp: message.sentTime || Date.now(),
    read: false,
  });

  // Handle foreground messages
  const handleForegroundMessage = (remoteMessage: any) => {
    const notification = mapRemoteMessageToNotification(remoteMessage);
    showLocalNotification(notification);
    setNotifications(prev => [notification, ...prev]);
  };

  // Handle notification
  const handleNotification = (notification: any) => {
    const newNotification: Notification = {
      id: notification.data?.id || notification.id || Date.now().toString(),
      title: notification.title || 'New Notification',
      message: notification.message,
      data: notification.data,
      timestamp: notification.timestamp || Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Show local notification
  const showLocalNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    PushNotification.localNotification({
      title: notification.title,
      message: notification.message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      ...(notification.data && {userInfo: notification.data}),
    });
  };

  // Schedule a local notification
  const scheduleNotification = (notification: {
    title: string;
    message: string;
    date: Date;
    data?: Record<string, any>;
  }) => {
    PushNotification.localNotificationSchedule({
      title: notification.title,
      message: notification.message,
      date: notification.date,
      allowWhileIdle: true,
      ...(notification.data && {userInfo: notification.data}),
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
    setNotifications([]);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? {...n, read: true} : n))
    );
  };

  // Clear notification by ID
  const clearNotification = (notificationId: string) => {
    PushNotification.cancelLocalNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    fcmToken,
    initialNotification,
    notifications,
    showLocalNotification,
    scheduleNotification,
    clearAllNotifications,
    markAsRead,
    clearNotification,
  };
};

export default useNotifications;
