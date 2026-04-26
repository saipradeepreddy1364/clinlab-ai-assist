import { Platform } from 'react-native';

// Mock Device for web
const Device = Platform.OS === 'web'
  ? { isDevice: false }
  : require('expo-device');

// Mock Notifications for web to prevent LegacyEventEmitter errors
const Notifications = Platform.OS === 'web' 
  ? {
      setNotificationHandler: () => {},
      getPermissionsAsync: async () => ({ status: 'undetermined' }),
      requestPermissionsAsync: async () => ({ status: 'undetermined' }),
      getExpoPushTokenAsync: async () => ({ data: '' }),
      setNotificationChannelAsync: async () => {},
      scheduleNotificationAsync: async () => '',
      AndroidImportance: { MAX: 4 },
    }
  : require('expo-notifications');

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: null, // show immediately
  });
}
